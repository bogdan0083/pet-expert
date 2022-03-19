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

var getPreviousVisibleSibling = function (elem, selector) {

  // Get the next sibling element
  var sibling = elem.previousElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  // If the sibling matches our selector, use it
  // If not, jump to the next sibling and continue the loop
  while (sibling) {
    if (sibling.matches(selector) && sibling.offsetParent !== null) return sibling;
    sibling = sibling.previousElementSibling;
  }
};

var getNextVisibleSibling = function (elem, selector) {

  // Get the next sibling element
  var sibling = elem.nextElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  // If the sibling matches our selector, use it
  // If not, jump to the next sibling and continue the loop
  while (sibling) {
    if (sibling.matches(selector) && sibling.offsetParent !== null) return sibling;
    sibling = sibling.nextElementSibling;
  }
};

document.addEventListener('DOMContentLoaded', function (e) {
  var fpPromo;
  var fpPromoElem = document.getElementById('fullpage-promo');
  var bottleTimeline;
  var triggerTl;
  var activeNormalSection = document.querySelector('.js-section-normal-scroll');
  var currentActiveBottleType = 'beer';
  var SCREEN_DOWN_XL = '(max-width: 1290px)';
  var SCREEN_DOWN_LG = '(max-width: 992px)';
  var SCREEN_DOWN_MD = '(max-width: 768px)';
  var promoTabTriggers = document.querySelectorAll('.js-promo-tab-trigger');
  var promoSlideshowChangeTrigger = document.querySelectorAll('.js-promo-slideshow-change-trigger');
  var beerSections = document.querySelectorAll('.js-section-beer');
  var waterSections = document.querySelectorAll('.js-section-water');
  var promoConceptsSections = document.querySelectorAll('.promo-concepts-section');
  var promoSlideshowTriggerLocked = false;
  var scrollLocked = false;
  var scrollEventRegistered = false;

  gsap.config({
    trialWarn: false
  });

  gsap.registerPlugin(SplitText);

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

        var nextSectionIsNormal = section.item.classList.contains('promo-concepts-section') && section.item.previousElementSibling.classList.contains('js-section-normal-scroll') && direction === 'up';

        if (nextSectionIsNormal) {
          activeNormalSection = next.item;
          destroyFullpagePromo();
          gsap.to(window, {
            duration: 1,
            ease: "power2.inOut",
            scrollTo: {y: activeNormalSection, offsetY: -activeNormalSection.clientHeight + window.innerHeight},
            onComplete: function () {
              document.addEventListener('scroll', onNormalSectionScroll);
            }
          });
          return false;
        }

        // if (getNextVisibleSibling('.js-section-normal-scroll')) {
        //   destroyFullpagePromo();
        //   return false;
        // }

        return true;
      },
      afterLoad: function (anchorLink, section) {
        if (section.item && section.item.classList.contains('js-section-normal-scroll')) {
          destroyFullpagePromo();
          activeNormalSection = section.item;
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

  var casesTimeline = gsap.timeline();

  casesTimeline.to('.js-cases', {
    scrollTrigger: {
      trigger: '.js-cases',
      end: '+=200%',
      start: 'bottom bottom',
      pin: true,
      pinSpacing: false,
      scrub: true,
    },
  });

  promoConceptsSections.forEach(function (item, index) {
    var content = promoConceptsSections[0].querySelectorAll('.promo-concepts__item')[index];
    var image = promoConceptsSections[0].querySelectorAll('.promo-concepts__image')[index];
    var logo = promoConceptsSections[0].querySelector('.promo-concepts__logo');
    var sectionTitle = promoConceptsSections[0].querySelector('.promo-concepts__section-title');
    var title = promoConceptsSections[0].querySelectorAll('.promo-concepts__title')[index];
    var desc = promoConceptsSections[0].querySelectorAll('.promo-concepts__desc')[index];
    var link = promoConceptsSections[0].querySelectorAll('.promo-concepts__link')[index];

    var splitTitle = new SplitText(title, {type: 'lines'});
    var splitDesc = new SplitText(desc, {type: 'lines'});
    new SplitText(desc, {type: 'lines'});

    if (index === 0) {
      var container = item.querySelector('.container');
      var logoTimeline = gsap.timeline({
        scrollTrigger: {
          scrub: false,
          trigger: item,
          start: '40% center',
          end: '51% center',
          onEnter: function (data) {
            logoTimeline.timeScale(1);
            console.log('enterig!');
          },
          onLeave: function (data) {
            console.log('leaving logo block');
          },
          onLeaveBack: function () {
            logoTimeline.timeScale(3).reverse();
            console.log('leaving logo block back');
          }
        },
      });

      logoTimeline.fromTo(logo, {alpha: 0}, {alpha: 1, y: 0}, '0');
      logoTimeline.fromTo(image, {alpha: 0, duration: 2}, {alpha: 1}, '0');
      logoTimeline.fromTo(sectionTitle, {alpha: 0}, {alpha: 1, y: 0}, '0.3');
    }

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: '45% center',
        end: '51% center',
        scrub: false,
        toggleActions: "restart none restart none",
        toggleClass: {targets: [content, image], className: "is-active"},
      }
    });

    tl.fromTo(splitTitle.lines, {
      y: '100%',
      ease: 'power3.out',
    }, {y: 0, duration: 1});

    tl.fromTo(splitDesc.lines, {
      y: '150%'
    }, {y: 0, duration: 0.7, stagger: 0.05}, '0.2');

    tl.fromTo(link, {
      alpha: 0
    }, {alpha: 1, duration: 1}, '-=0.4');

    if (index > 0) {
      var imagesTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          end: '+=100%',
          scrub: 0.5,
        }
      });
      var prevImage = promoConceptsSections[0].querySelectorAll('.promo-concepts__image')[index];

      imagesTimeline.fromTo(image, {y: '100%'}, {y: 0}, '0');
    }

    var isLast = index === promoConceptsSections.length - 1;
    if (!isLast) {
      var imagesParallaxTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'bottom bottom',
          end: '+=100%',
          scrub: 0.5,
        }
      });

      imagesParallaxTimeline.fromTo(image, {y: 0, immediateRender: false}, {y: '-30%', immediateRender: false}, '0');
    }
  });

  casesTimeline.to(promoConceptsSections[0], {
    scrollTrigger: {
      trigger: promoConceptsSections[0].querySelector('.promo-concepts__inner'),
      end: '+=400%',
      start: 'top',
      pin: true,
      scrub: true,
    },
  });

  function destroyFullpagePromo() {
    var scrollY = window.scrollY;
    fpPromo.setAutoScrolling(false);
    fpPromo.setKeyboardScrolling(false);
    fpPromo.setFitToSection(false);
    fpPromo.destroy('all');
    window.scrollTo(0, scrollY);
  }

  function onNormalSectionScroll(e) {
    if (activeNormalSection) {
      var offsetTop = activeNormalSection.offsetTop;

      if (offsetTop > window.scrollY) {

        document.removeEventListener('scroll', onNormalSectionScroll);
        var prevSection = getPreviousVisibleSibling(activeNormalSection, '.js-section:not(.hidden)');

        gsap.to(window, {
          duration: 4.7, ease: "power2.inOut", scrollTo: prevSection, onComplete: function () {
            prevSection.classList.add('active');
            activeNormalSection.classList.remove('active');
            initFullpagePromo();
          }
        });
      }

      if (offsetTop + activeNormalSection.clientHeight < (window.scrollY + window.innerHeight)) {
        e.preventDefault();
        var promoConceptsSection = document.querySelector('.promo-concepts-section');

        gsap.to(window, {
          duration: 1, ease: 'power2.inOut', scrollTo: promoConceptsSection, onComplete: function () {
            document.removeEventListener('scroll', onNormalSectionScroll);

            activeNormalSection.classList.remove('active');
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
