package com.ecolumea.webshop.api.admin.media;

public record AdminProductImageView(
    long id,
    long productId,
    String fileName,
    String title,
    String altText,
    int sortOrder,
    boolean isPrimary,
    String imageUrl
) {}
