function browserSupportsWebp() {
  var elem = document.createElement('canvas');

  if (!!(elem.getContext && elem.getContext('2d'))) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  } else {
    // very old browser like IE 8, canvas not supported
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function (e) {
  var fpPromo;
  var bottleTimeline;
  var triggerTl;
  var currentActiveBottleType = 'beer';
  var SCREEN_DOWN_XL = '(max-width: 1290px)';
  var SCREEN_DOWN_LG = '(max-width: 992px)';
  var SCREEN_DOWN_MD = '(max-width: 768px)';
  var promoTabTriggers = document.querySelectorAll('.js-promo-tab-trigger');
  var promoSlideshowChangeTrigger = document.querySelectorAll('.js-promo-slideshow-change-trigger');
  var beerSections = document.querySelectorAll('.js-section-beer');
  var waterSections = document.querySelectorAll('.js-section-water');
  var toAnimateBottleAppear = false;

  initSlideShow('beer');

  for (let i = 0; i < promoTabTriggers.length; i++) {
    promoTabTriggers[i].addEventListener("click", function (e) {
      e.preventDefault();
      var newBottleType = this.dataset.bottleType;
      if (currentActiveBottleType !== newBottleType) {
        currentActiveBottleType = newBottleType;
        rebuildSlideShowSections();
        initSlideShow(currentActiveBottleType);
      }

      setTimeout(function () {
        fpPromo.moveSectionDown();
      }, 50);
    });
  }

  for (let i = 0; i < promoSlideshowChangeTrigger.length; i++) {
    promoSlideshowChangeTrigger[i].addEventListener("click", function (e) {
      e.preventDefault();
      var newBottleType = this.dataset.bottleType;

      console.log(newBottleType)
      toAnimateBottleAppear = true;
      currentActiveBottleType = newBottleType;
      rebuildSlideShowSections();
      initSlideShow(currentActiveBottleType);

      setTimeout(function () {
        fpPromo.silentMoveTo(2);
      }, 50);
    });
  }

  function rebuildSlideShowSections() {
    beerSections.forEach(function (item) {
      item.classList.toggle('js-section');
      item.classList.toggle('hidden');
    });

    waterSections.forEach(function (item) {
      item.classList.toggle('js-section');
      item.classList.toggle('hidden');
    });
  }

  /*
    Инициализируем нужные промо секции с бутылкой на главной странице.
   */
  function initSlideShow(bottleType) {

    var canvas = document.getElementById("anim-" + bottleType);
    var canvasContainer = document.getElementById("anim-" + bottleType + "-inner-container");
    var context = canvas.getContext("2d");
    var endTriggerElem = bottleType === 'beer' ? beerSections[beerSections.length - 1] : waterSections[waterSections.length - 1];

    var img = {
      width: 1600,
      height: 900,
    }

    var wrh = img.width / img.height;
    var newWidth = canvas.width;
    var newHeight = newWidth / wrh;
    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = newHeight * wrh;
    }

    // @TODO: convert to es5
    var extension = browserSupportsWebp() ? 'webp' : 'png';

    var frameCount = bottleType === 'beer' ? 73 : 72;

    var images = [];
    var bottle = {
      frame: 0
    };

    if (bottleTimeline) {
      bottleTimeline.kill();
    }

    bottleTimeline = gsap.timeline(
      {
        ease: "none",
        scrollTrigger: {
          pin: true,
          trigger: '#anim-' + bottleType + "-container",
          spacer: true,
          pinSpacing: true,
          pinnedContainer: null,
          start: 'top',
          endTrigger: endTriggerElem,
          end: 'bottom bottom',
          scrub: 0,
          ease: "none",
        },
      });

    bottleTimeline.to(bottle, {
      frame: frameCount - 1,
      ease: "none",
      snap: "frame",
      duration: 1,
      onUpdate: renderBottleSprite // use animation onUpdate instead of scrollTrigger's onUpdate
    });

    bottleTimeline.to(canvasContainer, {
      x: '100%',
      duration: '0.2',
      ease: "ease-in-out",
    }, '0.320');

    bottleTimeline.to(canvasContainer, {
      x: '0%',
      duration: '0.20',
      ease: "ease-in-out",
    }, '0.534');

    bottleTimeline.to(canvasContainer, {
      x: '100%',
      duration: '0.20',
      ease: "ease-in-out",
    }, '0.838');

    if (fpPromo) {
      fpPromo.setAllowScrolling(false);
      fpPromo.setKeyboardScrolling(false);
      fpPromo.destroy('all');
    }

    fpPromo = new fullpage('#fullpage-promo', {
      //options here
      sectionSelector: '.js-section',
      scrollBar: true,
      onLeave: function (section, next, direction) {
        // @TODO: optimize animations
        var targets = next.item.querySelectorAll('.promo-slide__title, .promo-slide__desc, .promo-slide__items li');
        if (section.index === 1 && direction === 'up') {
          gsap.timeline()
            .set('.header', {display: 'block'})
            .to('.header', {alpha: 1});
        }

        // Появление первого слайда

        var tl = gsap.timeline();

        if (section.isFirst && direction === 'down') {
          gsap.timeline()
            .to('.header', {alpha: 0})
            .set('.header', {display: 'none'});

          tl.fromTo(next.item.querySelector('.anim-bottle-canvas'), {
            alpha: 0,
            x: 30,
          }, {alpha: 1, x: 0, delay: 0.5, stagger: 0.2});
        }

        if (toAnimateBottleAppear) {
          tl.fromTo(next.item.querySelector('.anim-bottle-canvas'), {
            alpha: 0,
            x: 30,
          }, {alpha: 1, x: 0, delay: 0.5, stagger: 0.2});
          toAnimateBottleAppear = false;
        }

        if (targets && targets.length > 0) {
          tl.fromTo(targets, {
            alpha: 0,
            x: 30,
          }, {alpha: 1, x: 0, delay: 0.5, stagger: 0.2}, '0');
        }

        return true;
      }
    });

    if (triggerTl) {
      triggerTl.kill();
    }

    var promoSections = document.querySelectorAll('.promo-slide--' + bottleType);
    var promoSectionHeight = promoSections[0].clientHeight;
    var triggerHeight = document.getElementById("promo-trigger-" + bottleType).clientHeight;

    triggerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#anim-' + bottleType + "-container",
        spacer: true,
        pinSpacing: true,
        pin: "#promo-trigger-" + bottleType,
        start: 'top',
        endTrigger: endTriggerElem,
        end: '+=' + (promoSectionHeight * (promoSections.length - 2) + triggerHeight) + 'px',
        scrub: 0,
        ease: "none",
      },
    });


    for (var i = 0; i < frameCount; i++) {
      var img = new Image();
      img.src = renderBottleFrame(i, bottleType);
      images.push(img);
    }

    images[0].onload = renderBottleSprite;

    function renderBottleFrame(index, bottleType) {
      var src = './img/' + bottleType + '/' + (index + 1) + '.png';
      return src;
    }

    function renderBottleSprite() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (bottleType == 'beer') {
        context.drawImage(images[bottle.frame], 0, 0, newWidth, newHeight);
      } else {
        console.log('triggered');
        if (images[bottle.frame]) {
          context.drawImage(images[bottle.frame], 0, 0, newWidth, newHeight);
        }
      }
    }
  }

  var swipe = new Swiper('.swiper', {
    slidesPerView: 5,
    spaceBetween: 10,
    direction: 'horizontal',
    loop: true,
    draggable: true,
    speed: 400,
    autoplay: true
  });


});

var header = document.querySelector('.header');
var headerToggle = document.querySelector('.header-toggle');
var headerBottom = document.querySelector('.header-bottom');

headerToggle.addEventListener('click', function (e) {
  headerToggle.classList.toggle('active');
  header.classList.toggle('active');
  headerBottom.classList.toggle('active');
})
