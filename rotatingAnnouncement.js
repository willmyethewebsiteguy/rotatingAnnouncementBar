/* =========
  Rotating Announcement Squarespace
  This Code is Licensed by Will-Myers.com
========== */

(function () {
  const utils = {
    emitEvent: function (type, detail = {}, elem = document) {
      if (!type) return;
      let event = new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        detail: detail,
      });
      return elem.dispatchEvent(event);
    },
    getPropertyValue: function (el, prop) {
      let propValue = window.getComputedStyle(el).getPropertyValue(prop),
          cleanedValue = propValue.trim().toLowerCase(),
          value = cleanedValue;

      /*If First & Last Chars are Quotes, Remove*/
      if (cleanedValue.charAt(0).includes('"') || cleanedValue.charAt(0).includes("'")) value = value.substring(1);
      if (cleanedValue.charAt(cleanedValue.length-1).includes('"') || cleanedValue.charAt(cleanedValue.length-1).includes("'")) value = value.slice(0, -1);;

      if (value == 'true') value = true;
      if (value == 'false') value = false;
      return value;
    },
    templateVersion: Static.SQUARESPACE_CONTEXT.templateVersion,
    blogFeedCount: 0
  };

  let RotatingAnnouncement = (function () {    

    function initRotation(instance) {
      let els = instance.elements.nodes,
        prevIndex = els.length - 1,
        activeIndex = 0,
        nextIndex = 1,
        prev = els[prevIndex],
        active = els[activeIndex],
        next = els[nextIndex],
        delay = instance.settings.delay,
        linkWrapper = instance.elements.linkWrapper;
  
      function showCurrent(){
        if (window.pauseAnnouncementRotate) return;
        els.forEach(el => el.classList.remove('next', 'prev', 'active'));
        ++activeIndex;
        ++prevIndex;
        ++nextIndex
        if (activeIndex >= els.length) activeIndex = 0;
        if (prevIndex >= els.length) prevIndex = 0
        if (nextIndex >= els.length) nextIndex = 0

        prev = els[prevIndex];
        active = els[activeIndex];
        next = els[nextIndex];
    
        prev.classList.add('prev');
        active.classList.add('active');
        next.classList.add('next');

        if (active.querySelector('a')) {
          let href = active.querySelector('a').getAttribute('href');
          linkWrapper.setAttribute('href', href);
        }
      }

      active.classList.add('active');
      next.classList.add('next');
      window.setInterval(showCurrent, delay)
    }

    function duplicateIfNeeded(instance){
      let nodes = instance.elements.nodes,
        container = instance.elements.container,
        length = instance.settings.length;

      if(length <= 3){
        let clonedNodes = Array.from(nodes).map(el => el.cloneNode(true));
        clonedNodes.forEach(clone => {
          container.insertAdjacentElement('beforeend', clone)
        });
      }
    }

    function setAnnouncementBarAttributes(instance){
      let container = instance.elements.container;

      if (!container.closest('#header')) return;
      let delay = utils.getPropertyValue(container, '--delay');
      container.dataset.delay = delay;
    }

    function setTemplateSize(instance){
      let tallestNode = instance.elements.tallestNode,
        container = instance.elements.container,
        height = tallestNode.offsetHeight + 'px';

      container.style.setProperty('--calculated-height', height);
    }

    function buildLinkWrapper(instance){
      let content = document.querySelector('.sqs-announcement-bar-content');
      let html = `<a class="sqs-announcement-bar-url" href="#" aria-labelledby="announcement-bar-text-inner-id"></a>`;
      content.insertAdjacentHTML('afterbegin', html);
    }

    function Constructor(el) {
      let instance = this;
      instance.settings = {
        el: el,
        get isAnnouncement() {
          return !!this.el.closest('#header');
        },
        get length() {
          return instance.elements.nodes.length;
        },
        get delay() {
          return this.el.dataset.delay || 2000;
        },
        hasLinks: el.querySelector('a')
      };
      instance.elements = {
        container: el,
        get nodes() {
          let nodes = Array.from(this.container.querySelectorAll(':scope > *'));
          nodes.forEach(node => {
            if (node.textContent.trim() === '') {  node.remove();  }
          });
          return nodes.filter(node => node.parentNode === this.container);
        },
        get tallestNode(){
          let tallestNode = null;
          let maxHeight = -Infinity;
          let nodeList = this.nodes;
          for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].style.height = 'auto'
            const height = parseInt(nodeList[i].offsetHeight);
            nodeList[i].style.auto = '';
            if (height > maxHeight) {
              tallestNode = nodeList[i];
              maxHeight = height;
            }
          }
          return tallestNode;
        },
        get linkWrapper() {
          return document.querySelector('.sqs-announcement-bar-url')
        }
      };
      
      if (instance.settings.length <= 1 ) {
        return;
      }

      setAnnouncementBarAttributes(instance);
      if (!instance.elements.linkWrapper && instance.settings.hasLinks) {
        buildLinkWrapper();
      }
      
      duplicateIfNeeded(instance);
      setTemplateSize(instance);
      initRotation(instance);
      el.classList.add('loaded');
      window.addEventListener('resize', function(){
        setTemplateSize(instance)
      })
    }

    return Constructor;
  }());

  let abDropzone = document.querySelector('.sqs-announcement-bar-dropzone');
  let observer = new MutationObserver(function(mutations_list) {
    mutations_list.forEach(function(mutation) {
      if (mutation.addedNodes.length !== 0){
        let announcementBar = document.querySelector('#announcement-bar-text-inner-id:not(.loaded)'),
      abRotate = announcementBar ? utils.getPropertyValue(announcementBar, '--rotating-announcement') : null;
        if (abRotate){
          announcementBar.setAttribute('data-wm-plugin', 'rotating-announcement');
          new RotatingAnnouncement(announcementBar);
        }
      }
    });
  });
  observer.observe(abDropzone, { 
    subtree: false, 
    childList: true, 
    attributes: false
  });

}());
