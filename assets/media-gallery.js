if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        liveRegion: this.querySelector('[id^="GalleryStatus"]'),
        viewer: this.querySelector('[id^="GalleryViewer"]'),
        thumbnails: this.querySelector('[id^="GalleryThumbnails"]')
      }
      this.mql = window.matchMedia('(min-width: 750px)');
      if (!this.elements.thumbnails) return;

      this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500));
      this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
        mediaToSwitch.querySelector('button').addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
      });
      if (this.dataset.desktopLayout !== 'stacked' && this.mql.matches) this.removeListSemantic();

      var el = this.querySelector('[aria-current="true"]').parentNode;
      this.scrollToActiveSlide(el);      

      this.querySelector('.product__media-list_btn-prev').addEventListener('click', this.btnClickHandlerPrev.bind(this));
      this.querySelector('.product__media-list_btn-next').addEventListener('click', this.btnClickHandlerNext.bind(this));
    }
    btnClickHandlerPrev(){
      var q = this.querySelector('[aria-current="true"]').parentNode;
      this.querySelector('[aria-current="true"]').removeAttribute('aria-current');
      var index = Number(Array.prototype.indexOf.call(q.parentElement.children, q))-1;
      if(index<0){
        index=this.querySelector('.thumbnail-slider__list').children.length-1;
      }
      q.parentElement.querySelectorAll('.thumbnail')[index].dispatchEvent(new CustomEvent('click'));
    }
    btnClickHandlerNext(){
      var q = this.querySelector('[aria-current="true"]').parentNode;
      this.querySelector('[aria-current="true"]').removeAttribute('aria-current');
      var index = Number(Array.prototype.indexOf.call(q.parentElement.children, q))+1;
      var max_index = this.querySelector('.thumbnail-slider__list').children.length-1;
      if(index>max_index){
        index=0;
      }
      q.parentElement.querySelectorAll('.thumbnail')[index].dispatchEvent(new CustomEvent('click'));
    }
    onSlideChanged(event) {
      const thumbnail = this.elements.thumbnails.querySelector(`[data-target="${ event.detail.currentElement.dataset.mediaId }"]`);
      this.setActiveThumbnail(thumbnail);
    }

    setActiveMedia(mediaId, prepend) {
      const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${ mediaId }"]`);
      this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
        element.classList.remove('is-active');
      });
      activeMedia.classList.add('is-active');

      /*if (prepend) {
        activeMedia.parentElement.prepend(activeMedia);
        if (this.elements.thumbnails) {
          const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${ mediaId }"]`);
          activeThumbnail.parentElement.prepend(activeThumbnail);
        }
        if (this.elements.viewer.slider) this.elements.viewer.resetPages();
      }*/
      this.preventStickyHeader();
      window.setTimeout(() => {
        if (this.elements.thumbnails) {
          activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
        }
        if (!this.elements.thumbnails || this.dataset.desktopLayout === 'stacked') {
          activeMedia.scrollIntoView({behavior: 'smooth'});
        }
      });
      this.playActiveMedia(activeMedia);

      if (!this.elements.thumbnails) return;
      const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${ mediaId }"]`);
      this.setActiveThumbnail(activeThumbnail);
      this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
    }

    setActiveThumbnail(thumbnail) {
      if (!this.elements.thumbnails || !thumbnail) return;

      this.elements.thumbnails.querySelectorAll('button').forEach((element) => element.removeAttribute('aria-current'));
      thumbnail.querySelector('button').setAttribute('aria-current', true);
      
      /*if(thumbnail.offsetTop < thumbnail.parentElement.scrollTop){
        thumbnail.parentElement.scrollTo({
          top: thumbnail.offsetTop
        });
      }*/
      this.scrollToActiveSlide(thumbnail);
    }
    scrollToActiveSlide(thumbnail){
      var ratio = String(this.querySelector('.slider__slide.is-active').getAttribute('data-aspect-ratio'));
      this.querySelector('.product__media-list').style.setProperty('--ratio', ratio);
      
      var media_container = this.querySelector('.thumbnail-slider__list'),
          _y = thumbnail.offsetTop-media_container.offsetTop,
          _h = media_container.offsetHeight,
          main_scrolltop = media_container.scrollTop,
          item_y = _y-main_scrolltop+thumbnail.offsetHeight,
          temp = 0;
  
      if(item_y > _h){
        temp = main_scrolltop + (item_y-_h);
        this.scrollTo(media_container, temp, 100, 'scrollTop');
      }
      else if(_y < main_scrolltop){
        temp = media_container.scrollTop - (main_scrolltop - _y);
        this.scrollTo(media_container, temp, 100, 'scrollTop');
      }
    }

    announceLiveRegion(activeItem, position) {
      const image = activeItem.querySelector('.product__modal-opener--image img');
      if (!image) return;
      image.onload = () => {
        this.elements.liveRegion.setAttribute('aria-hidden', false);
        this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace(
          '[index]',
          position
        );
        setTimeout(() => {
          this.elements.liveRegion.setAttribute('aria-hidden', true);
        }, 2000);
      };
      image.src = image.src;
    }

    playActiveMedia(activeItem) {
      window.pauseAllMedia();
      const deferredMedia = activeItem.querySelector('.deferred-media');
      if (deferredMedia) deferredMedia.loadContent(false);
    }

    preventStickyHeader() {
      this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
      if (!this.stickyHeader) return;
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }

    removeListSemantic() {
      if (!this.elements.viewer.slider) return;
      this.elements.viewer.slider.setAttribute('role', 'presentation');
      this.elements.viewer.sliderItems.forEach(slide => slide.setAttribute('role', 'presentation'));
    }

    scrollTo(el, to, duration, option) {
      Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
      };
  
      const element = el;
      const start = element[option],
            change = to - start,
            increment = 20;
      var currentTime = 0;
      
      const animateScroll = function(){
        currentTime += increment;
        const val = Math.easeInOutQuad(currentTime, start, change, duration);
        element[option] = val;
        if(currentTime < duration) {
          window.setTimeout(animateScroll, increment);
        }
      };
      animateScroll();
    }
  });
}