addEventListener(
  'DOMContentLoaded',
  function () {
    self.uceLoader({
      Template: customElements.get('uce-template'),
      Path: 'Components/',
      on: function (name) {
        if (name !== 'uce-template') {
          const xhr = new XMLHttpRequest()
          const Template = this.Template
          xhr.open('get', this.Path + name + '.uce', true)
          xhr.send(null)
          xhr.onload = function () {
            document.body.appendChild(
              Template.from(xhr.responseText)
            )
          }
        }
      }
    })
  },
  { once: true }
)
