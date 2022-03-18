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
  var fpPromoElem = document.getElementById('fullpage-promo');
  var bottleTimeline;
  var triggerTl;
  var normalSection = document.querySelector('.js-section-normal-scroll');
  var currentActiveBottleType = 'beer';
  var SCREEN_DOWN_XL = '(max-width: 1290px)';
  var SCREEN_DOWN_LG = '(max-width: 992px)';
  var SCREEN_DOWN_MD = '(max-width: 768px)';
  var promoTabTriggers = document.querySelectorAll('.js-promo-tab-trigger');
  var promoSlideshowChangeTrigger = document.querySelectorAll('.js-promo-slideshow-change-trigger');
  var beerSections = document.querySelectorAll('.js-section-beer');
  var waterSections = document.querySelectorAll('.js-section-water');
  var promoSlideshowTriggerLocked = false;
  var scrollLocked = false;
  var scrollEventRegistered = false;

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
      e.stopPropagation();
      e.stopImmediatePropagation();
      var newBottleType = this.dataset.bottleType;

      promoSlideshowTriggerLocked = true;

      fpPromoElem.classList.add('inactive');
      fpPromo.moveTo(2);

      setTimeout(function () {

        currentActiveBottleType = newBottleType;
        rebuildSlideShowSections();
        initSlideShow(currentActiveBottleType);

        fpPromo.silentMoveTo(2);

        promoSlideshowTriggerLocked = false;

      }, 700);

      setTimeout(function () {
        fpPromoElem.classList.remove('inactive');
      }, 750);
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

    if (fpPromo) {
      fpPromo.setAutoScrolling(false, 'internal');
      fpPromo.setAllowScrolling(true);
      fpPromo.setKeyboardScrolling(false);
    }

    initFullpagePromo();

    if (bottleTimeline) {
      bottleTimeline.scrollTrigger.kill();
      bottleTimeline.kill();
    }

    setTimeout(function () {
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

    }, 50);

    if (triggerTl) {
      triggerTl.scrollTrigger.kill();
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
        if (images[bottle.frame]) {
          context.drawImage(images[bottle.frame], 0, 0, newWidth, newHeight);
        }
      }
    }
  }

  function initFullpagePromo() {
    fpPromo = new fullpage('#fullpage-promo', {
      //options here
      sectionSelector: '.js-section',
      scrollBar: true,
      fitToSection: false,

      onLeave: function (section, next, direction) {
        console.log(section);
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
          }, {alpha: 1, x: 0, delay: 0.5, stagger: 0.1});

          tl.fromTo(next.item.querySelector('.promo-slide-trigger'), {
            alpha: 0,
          }, {alpha: 1, delay: 0.2});
        }

        if (targets && targets.length > 0) {
          tl.fromTo(targets, {
            alpha: 0,
            x: 30,
          }, {alpha: 1, x: 0, delay: 0.5, stagger: 0.1}, '0');
        }

        var doesNotContainNormalClass = !next.item.classList.contains('js-section-normal-scroll')

        if (doesNotContainNormalClass) {
          fpPromo.setAutoScrolling(true);
          fpPromo.setKeyboardScrolling(false);
        }

        var nextSectionIsNormal = section.item.classList.contains('promo-concepts-section') && next.item.classList.contains('js-section-normal-scroll');

        if (nextSectionIsNormal) {
          destroyFullpagePromo();
          gsap.to(window, {
            duration: 1, ease: 'ease-in-out', scrollTo: {y: normalSection, offsetY: -normalSection.clientHeight + window.innerHeight + 30}, onComplete: function () {
              document.addEventListener('scroll', onNormalSectionScroll);
            }
          });
          return false;
        }

        return true;
      },
      afterLoad: function (anchorLink, section) {
        if (section.item && section.item.classList.contains('js-section-normal-scroll')) {
          destroyFullpagePromo();
          if (!scrollEventRegistered) {
            document.addEventListener('scroll', onNormalSectionScroll);
            scrollEventRegistered = true;
          }
        } else {
          document.removeEventListener('scroll', onNormalSectionScroll);
          scrollEventRegistered = false;
        }
      }
    });
  }

  function destroyFullpagePromo() {
    var scrollY = window.scrollY;
    fpPromo.setAutoScrolling(false);
    fpPromo.setKeyboardScrolling(false);
    fpPromo.setFitToSection(false);
    fpPromo.destroy('all');
    window.scrollTo(0, scrollY);
  }

  function onNormalSectionScroll(e) {
    if (normalSection) {
      var offsetTop = normalSection.offsetTop;

      if (offsetTop > window.scrollY) {

        document.removeEventListener('scroll', onNormalSectionScroll);
        var lastPromoSlideElem = currentActiveBottleType === 'beer' ? beerSections[beerSections.length - 1] : waterSections[waterSections.length - 1];

        gsap.to(window, {
          duration: 0.7, ease: "power2.in", scrollTo: lastPromoSlideElem, onComplete: function () {
            lastPromoSlideElem.classList.add('active');
            normalSection.classList.remove('active');
            initFullpagePromo();
          }
        });
      }

      if (offsetTop + normalSection.clientHeight < (window.scrollY + window.innerHeight)) {
        e.preventDefault();
        var promoConceptsSection = document.querySelector('.promo-concepts-section');

        gsap.to(window, {
          duration: 1, ease: 'ease-in-out', scrollTo: promoConceptsSection, onComplete: function () {
            document.removeEventListener('scroll', onNormalSectionScroll);

            normalSection.classList.remove('active');
            promoConceptsSection.classList.add('active');
            initFullpagePromo();
          }
        });

        document.removeEventListener('scroll', onNormalSectionScroll);
        var scrollLocked = true;
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
