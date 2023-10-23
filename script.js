let dersler; // dersler değişkenini tanımlayın
let dersIndex = 0; // Varsayılan olarak ilk dersi göstermek için dersIndex'i tanımlayın

// Dersleri görüntülemek için bir fonksiyon
function gosterDers(dersIndex) {
  const ders = dersler[dersIndex];
  // Ders içeriğini güncelle
  var baslik = document.querySelector("#ders-baslik");
  var content = document.querySelector("#content");
  baslik.textContent = ders.dersAdi;
  content.textContent = ders.dersIcerik;
}

// JSON dosyasını çek
fetch("dersler.json")
  .then((response) => response.json())
  .then((data) => {
    dersler = data.dersler; // dersler değişkenini burada tanımlayın

    // İlk dersi görüntüle
    gosterDers(0);
  })
  .catch((error) => console.error("JSON dosyası alınamadı:", error));

// Önceki ders butonu
const oncekiDersButton = document.getElementById("oncekiDersButton");
oncekiDersButton.addEventListener("click", () => {
  if (dersler && dersIndex > 0) {
    dersIndex--;
    gosterDers(dersIndex);
  }
});

// Sonraki ders butonu
const sonrakiDersButton = document.getElementById("sonrakiDersButton");
sonrakiDersButton.addEventListener("click", () => {
  if (dersler && dersIndex < dersler.length - 1) {
    dersIndex++;
    gosterDers(dersIndex);
  }
});
