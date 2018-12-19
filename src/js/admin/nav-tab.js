import $ from 'jquery';

{
  let view = {
    el: $('#main'),
    changeNav(index) {
      let menuLi = this.el.find('#menu li.nav-item');
      let asideLi = this.el.find('#aside ul.first-level>li');
      let sectionLi = this.el.find('#section-wrapper ul.first-level>li');
      [menuLi, asideLi, sectionLi].map((elList)=> {
        this.changeClass(elList, index)
      })
    },
    changeClass(elList, index) {
      elList.eq(index).addClass('active').siblings('li').removeClass('active')
    }
  }
  let model = {
    data: {
      activeIndex: 0
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents();
    },
    bindEvents() {
      this.view.el.find('#menu').on('click', 'li.nav-item', (e)=> {
        let menu = $(e.currentTarget).attr('data-menu');
        window.eventHub.emit('select-menu', menu);
        let index = $(e.currentTarget).index();
        if(this.model.data.activeIndex !== index) {
          this.model.data.activeIndex = index;
          this.view.changeNav(index);
        }
      })
    }
  }
  controller.init(view, model)
}