# Case-Study
Bu projede, ürün ve kategori ekleme, silme, güncelleme ve listeleme ve arama servislerinin
olacağı bir API kaynağı yazılmasını beklemekteyiz.
Projeyi değerlendirirken şunları göz önünde bulunduracağız;
● Ürün bilgileri bir veri tabanına aktarılmakla birlikte, ürün ve kategori listesini Redis
üzerinden alınız.
● Bir arama yapılacaksa Elasticsearch üzerinden arama yapılmasını beklemekteyiz.
● Uygulama NodeJs-TypeScript ile geliştirilmelidir.
● Docker Image hazırlanması istenmektedir.
● Servislerin Docker Compose ile build alınıp çalıştırılabiliyor olması beklenmektedir.

Proje hikayesinde yer almayan detaylar insiyatifinize bırakılmıştır. Modern yazılım standartlarına
uygun bir şekilde, veri doğrulama katmanlarının uygulandığı, en iyi kod kalitesinin ortaya
koyulması beklenmektedir.


### Docker postgres
docker run --name postgres --restart always -d -p 5432:5432 -e POSTGRES_PASSWORD=123qwe -e POSTGRES_USER=destek -e POSTGRES_DB=destek postgres:14.4

### Docker redis
docker run --name redis --restart always -d -p 6379:6379 redis:6.2.7

### Docker elasticsearch
docker run --name elasticsearch -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.3.3