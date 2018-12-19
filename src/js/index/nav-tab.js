import $ from 'jquery'

{
  let view = {
    el: $('#header>nav'),
    changeNav(navItem) {
      navItem.addClass('active').siblings('li').removeClass('active')
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
      this.view.el.on('click', 'li.nav-item span', (e)=> {
        let navItem = $(e.target).closest('.nav-item');
        let index = navItem.attr('data-index');
        if(this.model.data.activeIndex !== index) {
          this.model.data.activeIndex = index;
          this.view.changeNav(navItem);
        }
      })
    }
  }
  controller.init(view, model)
}