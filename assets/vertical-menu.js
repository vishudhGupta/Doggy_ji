class headerMenuHandler extends HTMLElement {
  constructor() {
    super();
    this.menuholder = this.querySelector('.vertical-menu__items');
    this.button = this.querySelector('.vertical-menu__show-more');
    Shopify.designMode?setTimeout(this.resizeMenu.bind(this), 400):false;
    this.createEvents();
    var _this = this;
    if(!Shopify.designMode){
      document.addEventListener("DOMContentLoaded", (event) => {
        setTimeout(_this.resizeMenu.bind(_this), 200);
        setTimeout(_this.resizeMenu.bind(_this), 1000);
      });
      document.addEventListener('visibilitychange', function(){
        if(!document.hidden) {
          setTimeout(_this.resizeMenu.bind(_this), 200);
        }
      });
    }
  }
  resizeMenu(){
    const main_content = document.getElementById('MainContent'),
          items_top_position = window.scrollY + this.menuholder.getBoundingClientRect().top;
    
    if(!main_content.children.length) return;
    
    this.querySelectorAll('.hidden-menu-item').forEach((item) => {item.classList.remove('hidden-menu-item')});

    if(main_content.hasAttribute('data-menu-in-content') || main_content.classList.contains('menu-opened-by-default')){
      const index = Number(main_content.getAttribute('data-menu-in-content')) - 1,
      		section_height = window.scrollY + main_content.children[index].getBoundingClientRect().bottom,
      		menu_top_position = (this.closest('.menu-opened-by-default') ? 0 : window.scrollY) + this.getBoundingClientRect().top;
      var height = section_height - menu_top_position;

      if(this.closest('.menu-opened-by-default')){
        height = Math.min(height, this.menuholder.offsetHeight + 20);
		height = height < -1 ? this.menuholder.offsetHeight + 20 : height;
      }
      this.style.height = '100%';
      this.style.minHeight = height+'px';
      this.renderItems(items_top_position,height);
    }
    else{
      this.renderItems(items_top_position,620);
    }
    this.hasAttribute('hide-before-load') && this.removeAttribute('hide-before-load');
  }
  renderItems(items_top_position,height){
    var hide_item = true;
    var offsetmain = this.menuholder.children[0].offsetTop;
    for(var i=this.menuholder.children.length-1; i>=0; i--){
      var item = this.menuholder.children[i],
          y = item.offsetTop + offsetmain + item.offsetHeight;
      if(this.menuholder.children.length-1 == i && y <= height){
        this.button.classList.add('hide');
        return 'break';
      }
      else if(y > height){
        this.button.classList.contains('hide') && this.button.classList.remove('hide');
        item.classList.add('hidden-menu-item');
      }
      else{
        if(hide_item){
          hide_item = false;
          y > height-this.button.offsetHeight-15 && item.classList.add('hidden-menu-item');
        }
      }
    }
  }
  resizeMenuEvent(){
    //if(Shopify.designMode){

    setTimeout(this.resizeMenu.bind(this), 800);
  }
  createEvents(){
    window.addEventListener('resize', this.resizeMenuEvent.bind(this));
    this.button.addEventListener('click', this.clickHandler.bind(this));
  }
  clickHandler(event){
    if(this.button.classList.contains('active')){
      this.classList.remove('menu-show-items');
      setTimeout(this.hideItems.bind(this), 0);         
    }
    else{
      this.classList.add('menu-opened');
      this.button.classList.add('active');
      setTimeout(this.showItems.bind(this), 0);
    }
  }
  showItems(){
    this.classList.add('menu-show-items');
  }
  hideItems(){
    this.classList.remove('menu-opened');
    this.button.classList.remove('active');
    window.dispatchEvent(new Event('forStickyHeader'));
  }
}
customElements.define('vertical-menu', headerMenuHandler);


class verticalMenutext extends HTMLElement {
  constructor() {
    super();
    this.closest('.vertical-menu--hover__type2')&&this.closest('.vertical-menu--hover__type2').addEventListener('mouseenter', this.mouseenter.bind(this));
    this.closest('.vertical-menu__button')&&this.closest('.vertical-menu__button').addEventListener('mouseenter', this.mouseenter2.bind(this));
  }
  mouseenter(){
    var parent_width = this.closest('.vertical-menu--hover__type2').clientWidth;
    var item_width = this.clientWidth;
    var left = this.getBoundingClientRect().left - this.closest('.vertical-menu--hover__type2').getBoundingClientRect().left;
    var r = 0;

    if(document.querySelector('[dir="rtl"]')){
      r = Number(this.closest('.submenu-container')?31:15) - left;
      if(r<0){
        this.style.setProperty('--left', r + "px");
      }
      else{
        this.style.setProperty('--left', 0 + "px");
      }
    }
    else{
      r = Math.round(parent_width - item_width - left - Number(this.closest('.submenu-container')?31:10));
      if(r>0){
        this.style.setProperty('--left', r + "px");
      }
      else{
        this.style.setProperty('--left', 0 + "px");
      }
    }
  }
  mouseenter2(){
    var parent_width = this.closest('.vertical-menu__button').clientWidth;
    var item_width = this.clientWidth;
    var left = this.getBoundingClientRect().left - this.closest('.vertical-menu__button').getBoundingClientRect().left;
    var r = 0;

    if(document.querySelector('[dir="rtl"]')){
      var r = Math.round(20 - left);
      if(r<0){
        this.style.setProperty('--left', r + "px");
      }
      else{
        this.style.setProperty('--left', 0 + "px");
      }
    }
    else{
      var r = Math.round(parent_width - item_width - left - 20);
      if(r>0){
        this.style.setProperty('--left', r + "px");
      }
      else{
        this.style.setProperty('--left', 0 + "px");
      }
    }
  }
}
customElements.define('vertical-menutext', verticalMenutext);