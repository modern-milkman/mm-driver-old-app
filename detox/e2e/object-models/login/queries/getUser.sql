SELECT
    TOP (1) TRIM(u.[email]) AS [email]
FROM
    [milkman].[user] u
    INNER JOIN [milkman].[driver] d ON u.userID = d.userID
    INNER JOIN [dbo].[aspnetusers] a ON u.aspnetuserid = a.Id
    INNER JOIN [dbo].[aspnetuserroles] ur ON ur.userid = a.id
    INNER JOIN [dbo].[aspnetroles] r ON r.id = ur.roleid
WHERE
    aspnetuserid IS NOT NULL
    AND u.[isEnabled] = 1
    AND LEN(u.[password]) = 0
    AND TRIM(u.[email]) = TRIM(u.[username])
    AND r.[name] = 'Driver'
ORDER BY
    u.[userID] desc