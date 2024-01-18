DECLARE @RouteDate date = CAST(GETDATE() AS DATE) --This is today, otherwise can replace with 'YYYY-MM-DD'
DECLARE @DriverId int = NULL --Change this if you want a specific driver's route.
SELECT TOP 1
    D.driverID driverID,
    U.userID userID,
    U.username email,
    U.forename forename,
    U.surname surname,
    R.routeID routeId,
    R.description routeName,
    COUNT(DISTINCT A.AddressID) numberOfDeliveries
FROM
    OPERATIONS.[ROUTE] R
    JOIN [Operations].vwRouteAddress ra ON ra.routeID = r.routeID
    JOIN [Operations].DriverRoute dr ON dr.routeid = ra.routeid
    AND dr.isDefault = 1
    JOIN MILKMAN.[DRIVER] D ON D.driverID = dr.DriverId
    JOIN MILKMAN.[USER] U ON D.userID = U.userID
    JOIN MILKMAN.[ADDRESS] A ON RA.AddressId = A.AddressID
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
GROUP BY
    D.driverID,
    U.userID,
    U.username,
    U.forename,
    U.surname,
    R.routeID,
    R.description
ORDER BY
    numberOfDeliveries DESC