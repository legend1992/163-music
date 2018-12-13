import $ from '../../node_modules/jquery/dist/jquery';
{
  let view = {
    el: $('#aside>header')
  };
  let model = {};
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents();
      this.eventHubOn();
    },
    bindEvents() {
      this.view.el.on('click', (e)=> {
        if(!$(e.target).hasClass('active')) {
          $(e.target).addClass('active');
          window.eventHub.emit('create-song');
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-song', ()=> {
        this.view.el.removeClass('active')
      })
    }
  }
  controller.init(view, model)
}