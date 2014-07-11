Attribute VB_Name = "modRelinkTables"
Option Compare Database
Option Explicit



Public Sub relinkTables()
    Dim dictNewLinks As Dictionary
    Dim dbs As DAO.Database
    Dim tdf As DAO.TableDef
    '-----------------------------------------------------
    
    
    '-- Creating new dictionary --------------------------
    Set dictNewLinks = New Dictionary
    With dictNewLinks
        Call .Add(";DATABASE=C:\tasks\_makra\MAD\Main Database2.mdb", ";DATABASE=C:\ExcelAccess\MAD_DEV\MAD - adj DB.mdb")
        Call .Add(";DATABASE=C:\tasks\_makra\MAD\Main Database.mdb", ";DATABASE=C:\ExcelAccess\MAD_DEV\MAD - main DB.mdb")
    End With
    '-----------------------------------------------------
    
    Set dbs = CurrentDb
    For Each tdf In dbs.TableDefs
        If Left(tdf.Name, 4) <> "MSys" Then
            
            If dictNewLinks.Exists(tdf.connect) Then
                tdf.connect = dictNewLinks.item(tdf.connect)
                Call tdf.RefreshLink
                Debug.Print "Table [" & tdf.Name & "] successfully relinked to " & tdf.connect
            Else
                Debug.Print "Table [" & tdf.Name & "] cannot be relinked. Current link: " & tdf.connect
            End If
        
        End If
    Next tdf

End Sub

