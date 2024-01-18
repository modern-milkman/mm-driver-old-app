DECLARE @RouteDate date = CAST(GETDATE() AS DATE) --This is today, otherwise can replace with 'YYYY-MM-DD'
-- DECLARE @DriverId int = 3035 --Change this if you want a specific driver's route.
SELECT
    DISTINCT D.driverID driverID,
    U.userID userID,
    U.username email,
    U.forename forename,
    U.surname surname,
    R.routeID routeId,
    R.description routeName,
    A.AddressID addressId,
    A.postcodeOutward postcodeOutward,
    A.postcodeInward postcodeInward,
    A.longitude longitude,
    A.latitude latitude,
	C.userId customerId
FROM
    MILKMAN.[DRIVER] D
    JOIN MILKMAN.[USER] U ON D.userID = U.userID
    JOIN MILKMAN.[DRIVER_ROUTE] DR ON D.driverID = DR.driverID
    JOIN MILKMAN.[ROUTE] R ON DR.routeID = R.routeID
    JOIN MILKMAN.[ROUTE_AREA] RA ON R.routeID = RA.routeID
    JOIN MILKMAN.[ADDRESS] A ON RA.areaID = A.areaID
    JOIN MILKMAN.[ORDER] O ON A.AddressID = O.addressID
    JOIN MILKMAN.[ORDER_ITEM] OI ON O.orderID = OI.orderID
	INNER JOIN MILKMAN.[CUSTOMER] C ON O.customerId = C.customerID 
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
ORDER BY
    U.userID DESC