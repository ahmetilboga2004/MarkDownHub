// Mevcut ders index numarası
let dersIndex = 1;
window.addEventListener("load", function () {
  getApiData();
});

function scrollToTop() {
  window.scrollTo(0, 0); // Animasyonsuz olarak sayfanın en üstüne gitmek için
}

// Burda markdown kodlaını html e çeviren kütüphaneyi import ettik
var converter = new showdown.Converter();

// Dersler arası geçiş buttonları
var oncekiDersButton = document.querySelector("#oncekiDersButton");
oncekiDersButton.addEventListener("click", oncekiDersApi)
var sonrakiDersButton = document.querySelector("#sonrakiDersButton");
sonrakiDersButton.addEventListener("click", sonrakiDersApi)

// Ders Başlığı ve Ders içeriği elementleri
var dersBaslik = document.querySelector("#ders-baslik");
var dersIcerik = document.querySelector("#ders-icerik");

// --------- Editör elementleri ----------
// Editörü kapsayan div elementi
var editorDiv = document.querySelector("#edit-questions");

// Sorunun göründüğü element
var soruElement = document.querySelector("#ask-text-p");

// Cevabı yazdığımız element
var soruKodlari = document.querySelector("#markdown-area");

// Cevabı kontrol ettiğimiz button
var cevapKontrolButton = document.querySelector("#control-answer");

// Kodları sıfırladığımız button
var editorResetButton = document.querySelector("#reset-answer");

// Cevabı gösterdiğimiz button
var gosterCevapButton = document.querySelector("#show-answer");

// Html çıktılarının göründüğü element
var htmlPreview = document.querySelector("#html-area");

// Normal Çıktılarımızı gördüğümüz div elementi
var normalPreview = document.querySelector("#preview-area");

// ----- Modal Elementi -------
var myModal = document.querySelector("#infoModal");

// Ders verilerini bu fonksiyon yardımıyla alıyoruz.
function getApiData() {
  fetch(`/getDers`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("HTTP Hata: " + response.status);
      }
    })
    .then((data) => {
      const dersData = data;
      if (dersData.error) {
        console.error("Hata: ", dersData.error);
      } else {
        // Ders içeriğini güncelle
        icerikGuncelle(dersData);
      }
    });
}

// Gelen verileri sayfadaki elemanlara atıyoruz
function icerikGuncelle(veriler) {
  // Burada dersBaslik elementine dersin başlığını atadım
  dersBaslik.innerHTML = veriler.name;
  // dersIcerik elementine dersin içeriğini atadım
  dersIcerik.innerHTML = veriler.content;

  soruText = veriler.edit_text;
  markText = veriler.mark_text;

  if(veriler.is_prev) {

    oncekiDersButton.style.display = "block";
  } else {
    oncekiDersButton.style.display = "none"
  }

  // Eğer soru varsa soruyu göstereceğiz
  if (veriler.is_next) {

    if (veriler.is_ask) {
      soruGoster(soruText, markText, veriler.is_next);
      sonrakiDersButton.style.display = "none";
    } else {
      editorDiv.style.display = "none"
      sonrakiDersButton.style.display = "block";
    }
  } else {
    sonrakiDersButton.style.display = "none";
  }
  updatePreview()
}

// Önceki Derse gitmek için gerekli kontrolleri burada sağlayacağız
function oncekiDersApi() {
  scrollToTop()
  fetch("/oncekiDers")
  .then((response) => response.json())
  .then((data) => {
    // Diğer verileri de güncelleyin
    icerikGuncelle(data)
  })
  .catch((error) => console.error("JSON dosyası alınamadı:", error));
}

// Sonraki Derse gitmek için gerekli kontrolleri burada sağlayacağız
function sonrakiDersApi() {
  scrollToTop()
  fetch("/sonrakiDers")
    .then((response) => response.json())
    .then((data) => {
      // Diğer verileri de güncelleyin
      icerikGuncelle(data)
    })
    .catch((error) => console.error("JSON dosyası alınamadı:", error));
}


// Kullanıcının yazdığı cevabı kontrol ediyoruz
function cevapKontrol(is_next) {
  var userCevap = soruKodlari.value.trimEnd().toLowerCase();
  var s_next = is_next;
  // Eğer doğru ise tebrikler mesajı iletiyoruz.
  fetch(`/cevapKontrol?user_cevap=${encodeURIComponent(userCevap)}`)
  .then(response => response.json())
  .then(data => {
    if (data.is_true === true) {
      gosterModal("Tebrikler başarıyla geçtiniz", s_next);
    } else {
      gosterModal("Başarısız. Lütfen Tekrar kontrol edin.", false);
    }
  })
  .catch(error => {
    console.error("Hata oluştu: " + error);
  });


  // Gelen iletiyi alıp modal içinde ekranda gösterecek ve otomatik kapatacak fonksiyon
  function gosterModal(string, bool) {
    myModal.classList.add("show");
    myModal.style.display = "block";
    var bodyModal = myModal.querySelector(".modal-body");
    var titleModal = myModal.querySelector(".modal-title");
    titleModal.textContent= "Kontrol"
    bodyModal.innerHTML = string;
    var closeModal = myModal.querySelector("#close-modal");
    closeModal.addEventListener("click", function(){
      myModal.classList.remove('show')
      myModal.style.display = "none"
    })
    if (bool) {
      sonrakiDersButton.style.display = "block"
    } else {
      sonrakiDersButton.style.display = "none"
    }
  }
}

function soruGoster(soru, soru_markdown, is_next) {
  // Burda editör divimizi aktif ediyoruz.
  editorDiv.style.display = "block"

  // Soru metnine gelen soru verisini atıyoruz. Bu sayede soru metni ekranda görünecek
  soruElement.innerHTML = soru;
  // Aynı işlemi Markdown kodları için yapıyoruz.
  soruKodlari.value = soru_markdown;

  // Editördeki butonlarımıza olay dinleyicisi atıyoruz. Bu sayede işlem yapabiliriz.
  cevapKontrolButton.addEventListener("click", function () {
    cevapKontrol(is_next);
  });
  editorResetButton.addEventListener("click", function() {
    soruKodlari.value = soru_markdown
    updatePreview()
  });
  gosterCevapButton.addEventListener("click", function() {
    myModal.classList.add("show");
    myModal.style.display = "block";
    var bodyModal = myModal.querySelector(".modal-body");
    var titleModal = myModal.querySelector(".modal-title");
    titleModal.textContent = "Cevap"
    var closeModal = myModal.querySelector("#close-modal");
    closeModal.addEventListener("click", function(){
      myModal.classList.remove('show')
      myModal.style.display = "none"
    })
    fetch('/cevapGoster')
    .then(response => response.json())
    .then(data => {
      bodyModal.innerHTML = `<div class="d-flex justify-content-between">
      <div>${data.cevap}</div>
      <div><button type="button" id="copy-answer" class="btn btn-secondary">Kopyala</button></div>
      </div>`;
      document.querySelector('#copy-answer').addEventListener("click", function(){
        copyText = navigator.clipboard.writeText(data.cevap);
        this.textContent = "Kopyalandı"
      })
    })
    .catch(error => {
      bodyModal.innerHTML = "Cevap bilgisi alınırken bir hata oluştu.";
      console.error("Cevap bilgisi alınırken bir hata oluştu", error)
    });
  })
  

  // Mark Down editörüne bir yazı girdiğimiz zaman güncelleme yapacak.
  soruKodlari.addEventListener("input", updatePreview);

}

// Bu fonksiyon çağrıldığı zaman textarea'ları güncelliyor.
function updatePreview() {
  var markdownText = soruKodlari.value;

  // Markdown metnini HTML'e çevir
  var markdownHTML = converter.makeHtml(markdownText);

  // HTML metnini ekranda göster
  htmlPreview.value = markdownHTML;

  // Markdown'dan oluşturulan HTML'i önizleme alanında göster
  normalPreview.innerHTML = markdownHTML;
}

