Attribute VB_Name = "modTemp"
Option Compare Database
Option Explicit






Public Sub linkTable()
    Const NEW_LINKED_TABLE As String = ";DATABASE=C:\tasks\_makra\MAD\Main Database2.mdb"
    Dim dbs As DAO.Database
    Dim tdf As DAO.TableDef
    
    Set dbs = CurrentDb
    For Each tdf In dbs.TableDefs
        If Left(tdf.Name, 4) <> "MSys" Then
            Debug.Print tdf.connect
        End If
    Next tdf

End Sub



Public Function generujString(length As Integer) As String
    Const CHARACTERS As Byte = 26
    Const A_ASCII As Byte = 97
    Dim i As Integer
    Dim ascCode As Byte
    For i = 1 To length
        ascCode = Int(Rnd(Timer) * CHARACTERS) + A_ASCII
        
        If Rnd(Timer) > 0.5 Then
            generujString = generujString & UCase(Chr(ascCode))
        Else
            generujString = generujString & Chr(ascCode)
        End If
        
    Next i
End Function




Sub testCol()
    Const ARRAY_ITEMS As Integer = 100
    Dim tempAdjustment() As Adjustment
    Dim col As CArrayList:                              Set col = New CArrayList
    Dim iItem As ICollectionItem
    Dim iCounter As Integer
    Dim curAmount As Currency
    Dim lngMerchantId As Long
    Dim strApprover As String
    Dim strCurrencyCode As String
    Dim strCurrencySymbol As String
    Dim strAdjustmentComment As String
    Dim intTransactionCode As Integer
    Dim strReasonCode As String
    Dim lngIndex As Long
    
    ReDim tempAdjustment(1 To ARRAY_ITEMS)
    For iCounter = 1 To ARRAY_ITEMS
        Call Randomize(iCounter)
        curAmount = Rnd(Timer) * 10000
        lngMerchantId = Rnd(Timer) * 100000 + 1000000
        strApprover = generujString(10)
        strCurrencyCode = CInt(Rnd(Timer) * 1000)
        strCurrencySymbol = UCase(generujString(3))
        strAdjustmentComment = generujString(10)
        intTransactionCode = iCounter
        strReasonCode = UCase(generujString(3))
        
        Set tempAdjustment(iCounter) = newAdjustment.Amount(curAmount).Approver(strApprover). _
                    currencyCode(strCurrencyCode).currencySymbol(strCurrencySymbol). _
                    merchantId(lngMerchantId).AdjustmentComment(strAdjustmentComment). _
                    transactionCode(intTransactionCode).reasonCode(strReasonCode)
        
        lngIndex = Rnd(Timer) * iCounter
        
        Call col.addAt(tempAdjustment(iCounter), lngIndex)
        
    Next iCounter
    
    For Each iItem In col.getItems
        Debug.Print iItem.getProperty("")
    Next iItem
    
    
End Sub
