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
  var promoVideo = document.querySelector('.js-promo-video');
  var videoPlayButton = document.querySelector('.js-promo-play-video');
  var bottleTimeline;
  var triggerTl;
  var activeNormalSection = document.querySelector('.js-section-normal-scroll');
  var currentActiveBottleType = 'beer';
  var SCREEN_UP_LG = '(min-width: 992px)';
  var SCREEN_DOWN_LG = '(max-width: 992px)';
  var SCREEN_UP_MD = '(min-width: 768px)';
  var SCREEN_DOWN_MD = '(max-width: 768px)';
  var isDesktop = window.matchMedia(SCREEN_UP_LG).matches;
  var isTablet = window.matchMedia(SCREEN_DOWN_LG).matches && window.matchMedia(SCREEN_UP_MD).matches;
  var isMobile = window.matchMedia(SCREEN_DOWN_MD).matches;
  var promoTabTriggers = document.querySelectorAll('.js-promo-tab-trigger');
  var promoSlideshowChangeTrigger = document.querySelectorAll('.js-promo-slideshow-change-trigger');
  var beerSections = document.querySelectorAll('.js-section-beer');
  var waterSections = document.querySelectorAll('.js-section-water');
  var promoConceptsSections = document.querySelectorAll('.promo-concepts-section');
  var goDownButtons = document.querySelectorAll('.promo-slide__go-down');
  var promoSlideshowTriggerLocked = false;
  var scrollLocked = false;
  var scrollEventRegistered = false;

  if (isDesktop || isTablet) {
    if (promoVideo && videoPlayButton) {
      videoPlayButton.addEventListener('click', toggleVideo);
    }

    goDownButtons.forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        if (fpPromo) {
          fpPromo.moveSectionDown();
        }
      });
    })
  }

  gsap.config({
    trialWarn: false
  });

  gsap.registerPlugin(SplitText);

  if (isMobile) {
    var promoMobileSlider = new Swiper('.promo__mobile-slider', {
      loop: true,
      grabCursor: false,
    });
  }

  if (isDesktop) {
    initSlideShow('beer');
  }

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

  function toggleVideo(e) {
    e.preventDefault();

    var thumbSrc = promoVideo.dataset.thumbSrc;
    var currentSrc = promoVideo.getAttribute('src');

    if (currentSrc === thumbSrc) {
      promoVideo.setAttribute('src', promoVideo.getAttribute('data-full-src'));
    } else {
      promoVideo.setAttribute('src', thumbSrc);
    }

    this.hidden = !this.hidden;
    promoVideo.muted = !promoVideo.muted;
    promoVideo.controls = !promoVideo.controls;
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
      destroyFullpagePromo();
      initFullpagePromo();
    } else {
      initFullpagePromo();
    }

    if (bottleTimeline) {
      bottleTimeline.scrollTrigger.kill();
      bottleTimeline.kill();
    }

    bottleTimeline = gsap.timeline(
      {
        ease: "none",
        scrollTrigger: {
          pin: true,
          trigger: '#anim-' + bottleType + "-container",
          spacer: false,
          pinSpacing: false,
          pinType: "fixed",
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

    if (bottleType === 'water') {
      bottleTimeline.to(canvasContainer, {
        x: '-40%',
        duration: '0.2',
        ease: "ease-in-out",
      }, '0.100');
    }

    bottleTimeline.to(canvasContainer, {
      x: '-20%',
      duration: '0.20',
      ease: "ease-in-out",
    }, '0.534');

    bottleTimeline.to(canvasContainer, {
      x: '80%',
      duration: '0.20',
      ease: "ease-in-out",
    }, '0.838');

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
      verticalCentered: false,

      onLeave: function (section, next, direction) {
        // @TODO: optimize animations
        var targets = next.item.querySelectorAll('.promo-slide__title, .promo-slide__desc, .promo-slide__items li');
        var button = next.item.querySelector('.promo-slide__button');
        var goDownButton = next.item.querySelector('.promo-slide__go-down');
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
          if (button) {
            tl.fromTo(button, {
              alpha: 0,
              x: 30,
            }, {alpha: 1, x: 0}, '0.6');
          }
        }

        if (goDownButton) {
          tl.fromTo(goDownButton, {
            alpha: 0,
          }, {alpha: 1}, '1');
        }

        var doesNotContainNormalClass = !next.item.classList.contains('js-section-normal-scroll')

        if (doesNotContainNormalClass) {
          fpPromo.setAutoScrolling(true);
          fpPromo.setKeyboardScrolling(false);
        }

        var nextSectionIsNormal = section.item.classList.contains('promo-concepts-section') && next.item.classList.contains('js-section-normal-scroll') && direction === 'up';

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

  if (isDesktop) {
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
      var descParagraphs = desc.querySelectorAll('p');
      var link = promoConceptsSections[0].querySelectorAll('.promo-concepts__link')[index];

      var splitTitle = new SplitText(title, {type: 'lines'});

      var splitDesc = new SplitText(descParagraphs, {type: 'lines'});
      new SplitText(descParagraphs, {type: 'lines'});

      if (index === 0) {
        var container = item.querySelector('.container');
        var logoTimeline = gsap.timeline({
          scrollTrigger: {
            scrub: false,
            trigger: item,
            start: '45% center',
            end: '51% center',
            onEnter: function () {
              logoTimeline.timeScale(1);
            },
            onLeave: function () {
            },
            onLeaveBack: function () {
              logoTimeline.timeScale(3).reverse();
            }
          },
        });

        logoTimeline.fromTo(logo, {alpha: 0}, {alpha: 1}, '0');
        logoTimeline.fromTo(image, {alpha: 0, duration: 1}, {alpha: 1}, '0');
        logoTimeline.fromTo(sectionTitle, {alpha: 0}, {alpha: 1, y: 0}, '0.3');
      }

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: '45% center',
          end: '51% center',
          scrub: false,
          toggleActions: "restart none restart none",
          toggleClass: {targets: [content], className: "is-active"},
        }
      });

      tl.fromTo(splitTitle.lines, {
        y: '100%',
      }, {ease: "power2.out", y: 0, duration: 1});

      tl.fromTo(splitDesc.lines, {
        y: '150%',
      }, {ease: "power2.out", y: 0, duration: 0.7, stagger: 0.05}, '0.2');

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
            scrub: 0,
            immediateRender: false,
          }
        });

        imagesParallaxTimeline.to(image, {y: '-30%', immediateRender: false}, '0');
      }
    });

    casesTimeline.to(promoConceptsSections[0], {
      scrollTrigger: {
        trigger: promoConceptsSections[0].querySelector('.promo-concepts__inner'),
        end: '+=' + promoConceptsSections.length.toString() + '00%',
        start: 'top',
        pinSpacing: false,
        pin: true,
        scrub: true,
      },
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
    if (activeNormalSection) {
      var offsetTop = activeNormalSection.offsetTop;

      if (offsetTop > window.scrollY) {

        document.removeEventListener('scroll', onNormalSectionScroll);
        var prevSection = getPreviousVisibleSibling(activeNormalSection, '.js-section:not(.hidden)');

        gsap.to(window, {
          duration: 0.7, ease: "power2.inOut", scrollTo: prevSection, onComplete: function () {
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

  var teamSwiper;

  if (isDesktop) {
    var lastPromoConceptsSection = promoConceptsSections[promoConceptsSections.length - 1];
    var teamSection = document.querySelector('.team');

    ScrollTrigger.create({
      trigger: lastPromoConceptsSection,
      start: 'top top',
      endTrigger: teamSection,
      end: 'top top',
      pin: teamSection,
      pinSpacing: false,
      onEnter: function (data) {
        gsap.set(data.pin, {position: 'fixed', top: 0, left: 0, width: '100%'});
      },
      onEnterBack: function (data) {
        gsap.set(data.pin, {position: 'fixed', top: 0, left: 0, width: '100%'});
      },
      onLeaveBack: function (data) {
        gsap.set(data.pin, {position: 'relative', top: 0, left: 0, width: '100%'});
      },
      onLeave: function (data) {
        gsap.set(data.pin, {position: 'relative', top: 0, left: 0, width: '100%'});
      }
    });
  }

  // Слайдер для секции "Команда"
  var teamSlides = document.querySelectorAll('.team__slide');
  var teamSliderSpeed = 20000;
  var hoveredSlide = true;
  var hoveredSlides = [];
  var teamDurationAfterHover = null;
  teamSwiper = new Swiper('.team__slider', {
    slidesPerView: 2,
    loop: true,
    grabCursor: false,
    spaceBetween: 0,
    speed: 1000,
    autoplay: {
      delay: 2000,
    },
    freeModeMomentum: false,
    allowTouchMove: true,
    centeredSlides: true,
    slideToClickedSlide: true,
    on: {
      init: function (swiper) {
        if (isDesktop) {

          setTimeout(function () {
            swiper.wrapperEl.classList.add('ease-linear');
            teamInfiniteSlides(swiper);
            swiper.el.addEventListener('mousemove', onTeamSliderMove);
            swiper.el.addEventListener('mouseenter', onTeamSliderEnter);
            swiper.el.addEventListener('mouseleave', onTeamSliderLeave);
          }, 500);

        } else if (isMobile || isTablet) {
          // teamSwiper.el.addEventListener('click', onTeamSliderClick);
        }
      },
    },
    breakpoints: {
      360: {
        slidesPerView: 3,
      },
      600: {
        slidesPerView: 5
      },
      992: {
        centeredSlides: false,
        slidesPerView: 6,
        autoplay: false,
        speed: teamSliderSpeed,
        allowTouchMove: true,
        slideToClickedSlide: false,
        freeModeMomentum: false,
        watchSlidesVisibility: false,
        watchSlidesProgress: true,
      },
    },
  });

  function teamInfiniteSlides(swiper) {
    console.log('teamInfiniteSlides started');

    console.log(swiper.activeIndex);
    var speed = swiper.activeIndex !== 0 ? 12000 : teamSliderSpeed;
    swiper.slideTo(swiper.slides.length, speed);
    swiper.once('transitionEnd', onInfiniteSlideRepeat);
  }

  function onInfiniteSlideRepeat(swiper) {

    swiper.slideTo(0, 0);
    setTimeout(function () {
      teamInfiniteSlides(swiper);
    }, 0);
  }

  var onTeamSliderMove = function (e) {
    var translate = teamSwiper.getTranslate();

    var newHoveredSlide = e.target.closest('.swiper-slide');

    // @TODO: this breaks when hovered multiple times
    if (newHoveredSlide && hoveredSlide !== newHoveredSlide) {
      hoveredSlide = newHoveredSlide;

      var hoveredSlideIndex = hoveredSlide.dataset.swiperSlideIndex;
      var viewportOffset = hoveredSlide.getBoundingClientRect();
      var left = viewportOffset.left;

      // Если слайд еще не полностью в экране - игнорим
      if (left + 100 < 0) {
        return;
      } else if ((left - 100 + hoveredSlide.clientWidth) >= window.innerWidth) {
        return;
      }

      teamSwiper.off('transitionEnd');

      teamSwiper.wrapperEl.classList.remove('ease-linear');

      teamSwiper.params.speed = 1000;
      teamSwiper.params.allowTouchMove = true;

      var hoveredSlidesWithDuplicates = teamSwiper.slides.filter(function (item) {
        return item.dataset.swiperSlideIndex == hoveredSlideIndex;
      });

      teamSwiper.slides.forEach(function (item) {
        item.classList.remove('visible');
      });

      hoveredSlidesWithDuplicates.forEach(function (i) {
        i.classList.add('visible');
      });

      hoveredSlides = hoveredSlidesWithDuplicates;
    }
  };

  var onTeamSliderEnter = function () {
    if (teamSwiper) {
      teamSwiper.off('transitionEnd', onInfiniteSlideRepeat);
      var translate = teamSwiper.getTranslate();
      teamSwiper.setTransition(0);
      teamSwiper.setTranslate(translate);
      teamSwiper.updateProgress(translate);
      setTimeout(function () {
        teamSwiper.setProgress(teamSwiper.progress);
      }, 50);
    }
  }
  var onTeamSliderLeave = function () {

    var translate = teamSwiper.getTranslate();
    var maxTranslate = teamSwiper.maxTranslate();

    teamSwiper.updateProgress(translate);
    teamSwiper.params.speed = teamSliderSpeed;
    teamSwiper.wrapperEl.classList.add('ease-linear');

    var newSpeed = (teamSwiper.params.speed * (1 - teamSwiper.progress)).toFixed(0);

    teamSwiper.translateTo(maxTranslate, parseInt(newSpeed));
    teamSwiper.once('transitionEnd', onInfiniteSlideRepeat);
    if (hoveredSlides && hoveredSlides.length > 0) {
      hoveredSlides.forEach(function (i) {
        i.classList.remove('visible');
      });
      hoveredSlides = [];
    }
    hoveredSlide = false;
  };

  var onTeamSliderClick = function (e) {

    var newHoveredSlide = e.target.closest('.swiper-slide');
    if (newHoveredSlide) {

      var viewportOffset = newHoveredSlide.getBoundingClientRect();
      var slideWidth = newHoveredSlide.clientWidth;
      var left = viewportOffset.left;

      var translate = teamSwiper.getTranslate();

      teamSwiper.off('transitionEnd');

      setTimeout(function () {
        // teamSwiper.slideTo(teamSwiper.clickedIndex, 1000, false);
      }, 300);
    }
  }

  // Слайдер для секции "Партнеры"
  var partnersLogos = document.querySelectorAll('.partners-logos__item');
  var partnersSwiper = new Swiper('.partners__slider', {
    loop: true,
    speed: 1000,
    effect: "fade",
    slidesPerView: 3,
    fadeEffect: {
      crossFade: true
    },
    navigation: {
      nextEl: ".partners__slider-next"
    },
    on: {
      slideChange: function (swiper) {
        var slideIndex = swiper.realIndex;
        if (partnersLogos && partnersLogos.length > 0) {
          partnersLogos.forEach(function (item, idx) {
            item.classList.remove('active');
            if (slideIndex === idx) {
              item.classList.add('active');
            }
          });
        }
      }
    }
  });

  // @TODO: delegate to improve perfomance
  partnersLogos.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var clickedIndex = Array.prototype.indexOf.call(partnersLogos, item);
      partnersSwiper.slideToLoop(clickedIndex);
    });
  });

  var contactSliderElem = document.querySelector('.contacts__person-slider');

  if (contactSliderElem && (isTablet || isMobile)) {
    var contactSlider = new Swiper(contactSliderElem, {
      slidesPerView: 2,
      loopedSlides: 4,
      loop: true,
      watchSlidesVisibility: true,
      spaceBetween: 38,
      breakpoints: {
        600: {
          slidesPerView: 3,
        }
      }
    });
  }

  // Базовая имплементация табов
  // Имплементация табов
  var tabTriggers = document.querySelectorAll('[data-tab-trigger]');

  tabTriggers.forEach(function (item) {
    item.addEventListener('click', onTabTriggerClick);
  });

  function onTabTriggerClick(e) {
    e.preventDefault();

    if (this.classList.contains('active')) {
      return;
    }

    var tabTriggerSelector = this.dataset.tabTrigger;
    var tabElem = document.querySelector(tabTriggerSelector);

    var parentId = tabElem.dataset.parent;
    var parentElem = document.querySelector(parentId);

    var tabs = parentElem.querySelectorAll('.tab-content');
    var triggers = parentElem.querySelectorAll('[data-tab-trigger]');

    tabs.forEach(function (item) {
      item.classList.remove('tab-active');
      item.classList.remove('tab-visible');
    });

    triggers.forEach(function (item) {
      item.classList.remove('active');
    });

    tabElem.classList.add('tab-active');
    this.classList.add('active');

    // для эффекта анимации
    setTimeout(function () {
      tabElem.classList.add('tab-visible');
    }, 50);
  }
});

var header = document.querySelector('.header');
var headerToggle = document.querySelector('.header-toggle');
var headerBottom = document.querySelector('.header-bottom');

headerToggle.addEventListener('click', function (e) {
  headerToggle.classList.toggle('active');
  header.classList.toggle('active');
  headerBottom.classList.toggle('active');
})
