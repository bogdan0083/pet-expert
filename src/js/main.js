function browserSupportsWebp() {
  var elem = document.createElement('canvas');

  if (!!(elem.getContext && elem.getContext('2d'))) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  }
  else {
    // very old browser like IE 8, canvas not supported
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function (e) {

  new fullpage('#fullpage', {
    //options here
    sectionSelector: '.js-section',
  });
  var promoSlidesBeer = document.getElementById('promo-slides-beer');
  var animBottleImg = promoSlidesBeer.querySelector('.anim-bottle--img');
  var animationSection = promoSlidesBeer.querySelectorAll('.animation-section');

  var casesWrap = document.querySelector('.cases');
  var concept = document.querySelector('.concept');
  var conceptItem = document.querySelectorAll('.concept-item');

  var animationDescr = document.querySelectorAll('.animation-descr');

  var bannerChooseItem = document.querySelectorAll('.banner-choose--item');
  var bottleType = 'beer';
  if (window.innerWidth > 560) {

  } else {

    var animDel = 3;
  }
  var scrollBefore = 0;

  var swipe = new Swiper('.swiper', {
    slidesPerView: 5,
    spaceBetween: 10,
    direction: 'horizontal',
    loop: true,
    draggable: true,
    speed: 400,
    autoplay: true
  });

  setTimeout(() => {
    var canvas = document.getElementById("anim-bottle");
    var promoSlidesBeerElem = document.getElementById("promo-slides-beer");
    var promoSlidesBeerElemWidth = promoSlidesBeerElem.clientWidth;
    var context = canvas.getContext("2d");

    var windowHeight = Math.min(window.innerHeight, 900);

    var initialImgHeight = 900;

    var img = {
      width: 2000,
      height: 1000,
    }

    canvas.width = Math.min(1260, 1260 * (windowHeight / initialImgHeight));
    canvas.height = windowHeight;

    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);

    var centerShift_x = ((canvas.width - img.width * ratio) / 2);
    var centerShift_y = (canvas.height - img.height * ratio) / 2;

    // @TODO: convert to es5
    var extension = browserSupportsWebp() ? 'webp' : 'png';

    var frameCount = 67;
    var currentFrame = (index, bottleType) => (
      `./img/${bottleType}/${(index + 1)}.png`
    );

    var images = [];
    var bottle = {
      frame: 0
    };

    for (var i = 0; i < frameCount; i++) {
      var img = new Image();
      img.src = currentFrame(i, bottleType);
      images.push(img);
    }

    var tl = gsap.timeline(
      {
        ease: "none",
        scrollTrigger: {
          pin: true,
          trigger: '#anim-bottle',
          spacer: '#anim-bottle',
          start: 'top',
          endTrigger: '.promo-slides-container',
          end: 'bottom bottom',
          scrub: 0,
          ease: "none",
        },
      });



    tl.to(bottle, {
      frame: frameCount - 1,
      ease: "none",
      snap: "frame",
      duration: 1,
      onUpdate: render // use animation onUpdate instead of scrollTrigger's onUpdate
    });

    tl.to(canvas, {
      x: promoSlidesBeerElemWidth * 0.4,
      duration: '0.08',
      ease: "ease-out",
    }, '0.320');

    tl.to(canvas, {
      x: '-10%',
      duration: '0.15',
      ease: "ease-out",
    }, '0.560');

    tl.to(canvas, {
      x: promoSlidesBeerElemWidth * 0.4,
      duration: '0.08',
      ease: "ease-out",
    }, '0.838');

    images[0].onload = render;

    function render(data) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (bottleType == 'beer') {
        context.drawImage(images[bottle.frame], 250, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      } else {
        context.drawImage(images[bottle.frame], 200, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      }
    }

    animationDescr.forEach(function (item, index) {
      item.addEventListener('click', function (e) {

        if (bottleType == 'water') {
          document.querySelector('.animation-section .title.big').innerHTML = 'Пиво';
          animationDescr.forEach(function (item, index) {
            item.querySelector('span').innerHTML = 'Решения для воды';
            item.querySelector('img').src = './img/water-i.svg';
          })
          bottleType = 'beer';
        } else {
          document.querySelector('.animation-section .title.big').innerHTML = 'Вода';
          animationDescr.forEach(function (item, index) {
            item.querySelector('span').innerHTML = 'Решения для пива';
            item.querySelector('img').src = './img/beer-i.svg';
          })
          bottleType = 'water';
        }
        // animBottleImg.src = './img/'+ bottleType + '/'+bottleAnim+'.png';

        images = [];

        for (var i = 0; i < frameCount; i++) {
          var img = new Image();
          img.src = currentFrame(i, bottleType);
          images.push(img);
        }

        setTimeout(() => {
          render();
        }, 100);
      })
    })

    bannerChooseItem.forEach(function (item, index) {
      item.addEventListener('click', function (e) {
        if (index == 0) {
          document.querySelector('.animation-section .title.big').innerHTML = 'Пиво';
          animationDescr.forEach(function (item, index) {
            item.querySelector('span').innerHTML = 'Решения для воды';
            item.querySelector('img').src = './img/water-i.svg';
          })
          bottleType = 'beer';
          // document.querySelector('.pin-spacer').style.left = '0%';
          // animBottleImg.src = './img/'+ bottleType + '/'+bottleAnim+'.png';
        } else {
          document.querySelector('.animation-section .title.big').innerHTML = 'Вода';
          animationDescr.forEach(function (item, index) {
            item.querySelector('span').innerHTML = 'Решения для пива';
            item.querySelector('img').src = './img/beer-i.svg';
          })
          bottleType = 'water';
          bottleType = 'water';
          // document.querySelector('.pin-spacer').style.left = '-10%';
          // animBottleImg.src = './img/'+ bottleType + '/'+bottleAnim+'.png';
        }


        images = [];

        for (var i = 0; i < frameCount; i++) {
          var img = new Image();
          img.src = currentFrame(i, bottleType);
          images.push(img);
        }
        bottle.frame = 1;

        setTimeout(() => {
          render();
        }, 100);


      })
    })
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
