--This is today, otherwise can replace with 'YYYY-MM-DD'
DECLARE @RouteDate date = CAST(GETDATE() AS DATE);

--Change this if you want a specific driver's route.
-- DECLARE @DriverId int = NULL;
WITH deliveries AS (
    SELECT
        R.description routeName,
        CASE
            WHEN BI.childProductItemId IS NOT NULL THEN BI.childProductItemId
            ELSE OI.product_itemID
        END AS product_itemID,
        CASE
            WHEN BI.childProductId IS NOT NULL THEN BI.childProductId
            ELSE p.productID
        END AS productID,
        CASE
            WHEN bi.childName IS NOT NULL THEN bi.childName
            ELSE p.name
        END AS name,
        p.weight_unit,
        [pi].IsBundle,
        [pi].parent_product_itemID,
        A.AddressID,
        O.delivery_stateID,
        OI.outOfStock,
        CASE
            WHEN BI.quantity IS NOT NULL THEN OI.quantity * BI.quantity
            ELSE OI.quantity
        END AS quantity,
        [BI].bundleName
    FROM
        MILKMAN.[DRIVER] D
        INNER JOIN MILKMAN.[USER] U ON D.userID = U.userID
        INNER JOIN MILKMAN.[DRIVER_ROUTE] DR ON D.driverID = DR.driverID
        INNER JOIN MILKMAN.[ROUTE] R ON DR.routeID = R.routeID
        INNER JOIN MILKMAN.[ROUTE_AREA] RA ON R.routeID = RA.routeID
        INNER JOIN MILKMAN.[ADDRESS] A ON RA.areaID = A.areaID
        INNER JOIN MILKMAN.[ORDER] O ON A.AddressID = O.addressID
        INNER JOIN MILKMAN.[ORDER_ITEM] OI ON O.orderID = OI.orderID
        INNER JOIN MILKMAN.[product_item] [pi] ON [pi].product_itemID = [oi].product_itemID
        INNER JOIN MILKMAN.[product] p ON p.productID = [pi].productID
        LEFT JOIN (
            -- checks if the current product is a bundle & if so, grab the children 
            SELECT
                child.quantity,
                p.[name] [childName],
                bundle.[name] [bundleName],
                sp.productID [childProductId],
                child.product_itemID [childProductItemId],
                bundle.product_itemID [bundleProductItemId],
                bundle.productID [bundleProductId]
            FROM
                milkman.product_item child
                INNER JOIN (
                    SELECT
                        a.*,
                        p.name
                    FROM
                        milkman.product_item a
                        INNER JOIN milkman.product p ON p.productID = a.productID
                    WHERE
                        IsBundle = 1
                ) AS bundle ON child.parent_product_itemID = bundle.product_itemID
                INNER JOIN milkman.supplier_product sp ON sp.supplier_productID = child.supplier_productID
                INNER JOIN milkman.product p ON p.productID = sp.productID
        ) bi ON bi.bundleProductItemId = [pi].product_itemID
    WHERE
        1 = 1
        AND O.orderDate = @RouteDate
        AND (
            R.splitRouteDate IS NULL
            OR R.splitRouteDate = @RouteDate
        )
        AND OI.quantity > 0 --Excludes any items that somehow had an order quanity of 0, same behaviour as /GetForDriver
        AND OI.outOfStock = 0
        AND (
            @DriverId IS NULL
            OR D.driverID = @DriverId
        )
        AND O.delivery_stateID = 1
)
SELECT
    DISTINCT routeName,
    --product_itemID [productItemId],
    productID [productId],
    [name],
    SUM(quantity) [quantity]
FROM
    deliveries
GROUP BY
    routeName,
    --product_itemID,
    productID,
    [name]