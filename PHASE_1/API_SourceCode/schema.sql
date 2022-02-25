
DROP TABLE IF EXISTS article;
CREATE TABLE article (
    article_id          int PRIMARY KEY,
    title               TEXT NOT NULL,
    body                TEXT NOT NULL,
    publication_date    DATE NOT NULL
);
