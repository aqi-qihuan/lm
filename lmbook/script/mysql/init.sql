create database lmbook;
create database lmbook_intr;
create database lmbook_article;
create database lmbook_user;
create database lmbook_payment;
create database lmbook_account;
create database lmbook_reward;
create database lmbook_comment;
create database lmbook_tag;

# 准备 canal 用户（8.4 起默认认证插件为 caching_sha2_password，canal 兼容性差，显式用 mysql_native_password）
CREATE USER 'canal'@'%' IDENTIFIED WITH mysql_native_password BY 'canal';
GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' WITH GRANT OPTION;