import $ from 'jquery'

{
  let view = {
    el: $('#header>nav'),
    changeNav(e, index) {
      $(e.currentTarget).addClass('active').siblings('li').removeClass('active');
      this.menuSelect(index)
    },
    menuSelect(index) {
      $('#main #section-wrapper>li').eq(index).addClass('active').siblings('li').removeClass('active')
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
      this.view.el.on('click', 'li.nav-item', (e)=> {
        let index = $(e.currentTarget).attr('data-index');
        if(this.model.data.activeIndex !== index) {
          this.model.data.activeIndex = index;
          this.view.changeNav(e, index);
        }
      })
    }
  }
  controller.init(view, model)
}