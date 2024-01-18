DECLARE @RouteDate date = CAST(GETDATE() AS DATE) --This is today, otherwise can replace with 'YYYY-MM-DD'
DECLARE @DriverId int = NULL --Change this if you want a specific driver's route.
SELECT
    TOP 1 D.driverID driverID,
    U.userID userID,
    U.username email,
    U.forename forename,
    U.surname surname,
    R.routeID routeId,
    R.description routeName,
    COUNT(DISTINCT A.AddressID) numberOfDeliveries
FROM
    MILKMAN.[DRIVER] D
    JOIN MILKMAN.[USER] U ON D.userID = U.userID
    JOIN MILKMAN.[DRIVER_ROUTE] DR ON D.driverID = DR.driverID
    JOIN MILKMAN.[ROUTE] R ON DR.routeID = R.routeID
    JOIN MILKMAN.[ROUTE_AREA] RA ON R.routeID = RA.routeID
    JOIN MILKMAN.[ADDRESS] A ON RA.areaID = A.areaID
    JOIN MILKMAN.[ORDER] O ON A.AddressID = O.addressID
    JOIN MILKMAN.[ORDER_ITEM] OI ON O.orderID = OI.orderID
WHERE
    1 = 1
    AND O.orderDate = @RouteDate
    AND (
        R.splitRouteDate IS NULL
        OR R.splitRouteDate = @RouteDate
    )
    AND OI.quantity > 0 --Excludes any items that somehow had an order quanity of 0, same behaviour as /GetForDriver
    AND (
        @DriverId IS NULL
        OR D.driverID = @DriverId
    )
    AND O.delivery_stateID = 1
GROUP BY
    D.driverID,
    U.userID,
    U.username,
    U.forename,
    U.surname,
    R.routeID,
    R.description
ORDER BY
    U.userID DESC