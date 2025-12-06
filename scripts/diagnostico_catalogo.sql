-- Consulta 1: Listar todas las categorías con sus campos principales
SELECT id, nombre, descripcion 
FROM categorias
ORDER BY id;

-- Consulta 2: Listar cada categoría junto con el número de diseños asociados
-- Se usa LEFT JOIN para incluir categorías que podrían no tener diseños aún
SELECT 
    c.nombre AS categoria, 
    COUNT(d.id) AS total_disenos
FROM categorias c
LEFT JOIN disenos d ON c.id = d.categoria_id
GROUP BY c.id, c.nombre
ORDER BY total_disenos DESC;

-- Consulta 3: Top 10 diseños con más descargas y sus categorías
SELECT 
    d.nombre AS diseno,
    c.nombre AS categoria,
    d.descargas_count AS descargas,
    d.precio
FROM disenos d
JOIN categorias c ON d.categoria_id = c.id
ORDER BY d.descargas_count DESC
LIMIT 10;
