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


### How to run
- docker-compose up --build
- application run port 4000 on localhost

### How to stop and clean resources
- docker-compose down -v --remove-orphans

### Prerequisite
- docker with version Docker version 20.10.17, build 100c701

### Features
- the project's only dependencies is postgresql, app can work without redis and elastic but it perform best performance with them.

### Warnings
- In high load and incase redis and elastic are down, postgres might be unresponsive, it is your responsiblity to set up postgres cluster and serve high throughput in postgres.
 