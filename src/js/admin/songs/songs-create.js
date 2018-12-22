import $ from 'jquery';
{
  let view = {
    el: $('#songs-create')
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
          window.eventHub.emit('create-songs');
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-songs', ()=> {
        this.view.el.removeClass('active')
      })
      window.eventHub.on('songs-list-empty', ()=> {
        this.view.el.addClass('active');
      })
    }
  }
  controller.init(view, model)
}