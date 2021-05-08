self.loadFromGithub = async (type, label, sha) => {
  const { editedData, data } = self.GlobalContext

  // Check if it exists in storage
  let cacheIndex = data[type].findIndex(cache => cache._id === label)

  if (cacheIndex === -1) {
    // Load the product from Github!
    let content
    try {
      if (sha) {
        content = await self.getFileContent(sha)
      } else {
        content = await self.getBranchDirectoryContent(`${type}/${label}.yaml`)
      }
    } catch (error) {
      content = editedData[type].find(res => (res._id === label) || (sha && (res.sha === sha)))
    }

    const foundData = {
      _id: label,
      content: content || {}
    }

    if (content) {
      foundData.sha = foundData.content.sha
      delete foundData.content.sha
    } else {
      return null
    }

    cacheIndex = data[type].push(foundData) - 1
  }

  return cacheIndex
}

self.loginToOctoKit = async (authentication) => {
  const { Octokit } = await import('https://cdn.skypack.dev/@octokit/rest')
  const { throttling } = await import('https://cdn.skypack.dev/@octokit/plugin-throttling')

  const MyOctokit = Octokit.plugin(throttling)

  self.GlobalContext.octokit = new MyOctokit({
    auth: authentication,
    throttle: {
      onRateLimit: async (retryAfter, options, octokit) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`
        )

        const ratelimit = await octokit.rateLimit.get()

        document.getElementById('topnavbar').setRatelimit(ratelimit.data.rate.reset)

        if (options.request.retryCount === 0) {
          // only retries once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      },
      onAbuseLimit: (retryAfter, options, octokit) => {
        // does not retry, only logs a warning
        octokit.log.warn(
          `Abuse detected for request ${options.method} ${options.url}`
        )
      }
    }
  })

  try {
    if (authentication) {
      const res = await self.GlobalContext.octokit.request('GET /user')
      self.GlobalContext.githubUser = res.data
    }

    return true
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.

    return false
  }
}

self.getBranchDirectoryContent = async (directory) => {
  const { settings, octokit } = self.GlobalContext

  try {
    const res = await octokit.request('GET /repos/:owner/:repo/contents/:path', {
      owner: settings.repo.owner,
      repo: settings.repo.name,
      path: directory.substr(0, 1).toUpperCase() + directory.substr(1),
      headers: {
        'If-None-Match': ''
      }
    })

    if (res.data instanceof Array) {
      return res.data.map(product => {
        return {
          label: product.name.replace('.yaml', ''),
          path: product.path,
          sha: product.sha,
          url: product.html_url
        }
      })
    } else {
      const jsonContent = window.jsyaml.load(b64DecodeUnicode(res.data.content), { schema: window.jsyaml.JSON_SCHEMA })
      return {
        ...jsonContent,
        sha: res.data.sha
      }
    }
  } catch (error) {
    console.log(error)

    throw error
  }
}

self.getFileContent = async (sha) => {
  const { octokit, settings } = self.GlobalContext

  try {
    const res = await octokit.request('GET /repos/:owner/:repo/git/blobs/:file_sha', {
      owner: settings.repo.owner,
      repo: settings.repo.name,
      file_sha: sha,
      headers: {
        'If-None-Match': ''
      }
    })

    const jsonContent = window.jsyaml.load(b64DecodeUnicode(res.data.content), { schema: window.jsyaml.JSON_SCHEMA })

    return {
      ...jsonContent,
      sha: res.data.sha
    }
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.

    throw error
  }
}

self.createForkIfNotExists = async () => {
  const { githubUser, octokit, settings } = self.GlobalContext

  try {
    await octokit.request('GET /repos/:owner/:repo', {
      owner: githubUser.login,
      repo: settings.repo.name
    })
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.

    if (error.status === 404) {
      // Create fork.
      await octokit.request('POST /repos/:owner/:repo/forks', {
        owner: settings.repo.owner,
        repo: settings.repo.name
      })
    }
  }
}

self.getOrCreateBranchIfNotExists = async (branchName) => {
  const { githubUser, octokit, settings } = self.GlobalContext

  try {
    const res = await octokit.request('GET /repos/:owner/:repo/branches/:branch', {
      owner: githubUser.login,
      repo: settings.repo.name,
      branch: branchName
    })

    return res.data
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.

    if (error.status === 404) {
      // Create branch.
      const res = await octokit.request('GET /repos/:owner/:repo/git/refs/head', {
        owner: settings.repo.owner,
        repo: settings.repo.name
      })

      const mainHead = res.data.find(branch => branch.ref === 'refs/heads/main')

      const newBranch = await octokit.request('POST /repos/:owner/:repo/git/refs', {
        owner: githubUser.login,
        repo: settings.repo.name,
        ref: `refs/heads/${branchName}`,
        sha: mainHead.object.sha
      })

      return newBranch.data
    }
  }
}

self.createCommit = async (branchSHA, branchName, dataArr) => {
  const { githubUser, octokit, settings } = self.GlobalContext

  try {
    const res = await octokit.request('GET /repos/:owner/:repo/git/commits/:commit_sha', {
      owner: githubUser.login,
      repo: settings.repo.name,
      commit_sha: branchSHA
    })

    const treeSHA = res.data.tree.sha

    const files = dataArr.map(data => {
      return {
        path: data.fileName,
        type: 'blob',
        mode: '100644',
        content: data.content
      }
    })

    const treesRes = await octokit.request('POST /repos/:owner/:repo/git/trees', {
      owner: githubUser.login,
      repo: settings.repo.name,
      base_tree: treeSHA,
      tree: files
    })

    const newTreeSHA = treesRes.data.sha

    const newCommit = await octokit.request('POST /repos/:owner/:repo/git/commits', {
      owner: githubUser.login,
      repo: settings.repo.name,
      parents: [branchSHA],
      message: `uploading ${files.length} changes.\nUploaded via PPSL App.`,
      tree: newTreeSHA
    })

    const newCommitSHA = newCommit.data.sha

    const pushToHead = await octokit.request('PATCH /repos/:owner/:repo/git/refs/:ref', {
      owner: githubUser.login,
      repo: settings.repo.name,
      ref: `heads/${branchName}`,
      sha: newCommitSHA
    })

    return pushToHead.data
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.
  }
}

self.createPullRequest = async (branchName, data) => {
  const { githubUser, octokit, settings } = self.GlobalContext

  try {
    const res = await octokit.request('POST /repos/:owner/:repo/pulls', {
      owner: settings.repo.owner,
      repo: settings.repo.name,
      head: `${githubUser.login}:${branchName}`,
      base: 'main',
      title: `${data.length} changes`,
      body: `**This change was uploaded via the PPSL App.**\n\`\`\`\nChanges:\n${data.map(res => res.fileName).join('\n')}\n\`\`\`\nPlease check me for errors.`
    })

    return res.data
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.
    openExternalURL('_blank', `https://www.github.com/${settings.repo.owner}/${settings.repo.name}/pulls`)
  }
}

self.checkIfPRIsMergedOrClosed = async (prNumber) => {
  const { octokit, settings } = self.GlobalContext

  try {
    const res = await octokit.pulls.get({
      owner: settings.repo.owner,
      repo: settings.repo.name,
      pull_number: prNumber,
      headers: {
        'If-None-Match': ''
      }
    })

    return {
      body: res.data.body,
      sha: res.data.merge_commit_sha,
      mergedAt: res.data.merged_at,
      closedAt: res.data.closed_at,
      state: res.data.state
    }
  } catch (error) {
    console.error(error)
    // TODO: POPUP ERROR MODAL.
  }
}
