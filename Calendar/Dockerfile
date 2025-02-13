FROM php:8.1-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP necessárias
RUN docker-php-ext-install pdo pdo_mysql zip gd

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite

# Configurar variável de ambiente para permitir execução do Composer como root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar arquivos do projeto
COPY . /var/www/html/

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html

# Instalar dependências do Composer
RUN cd /var/www/html && \
    composer require setasign/fpdf && \
    composer install --no-interaction --optimize-autoloader

# Expor porta 80
EXPOSE 80 