Attribute VB_Name = "modArrays"
Option Compare Database
Option Explicit



Private Const CLASS_NAME As String = "modArrays"




'
'Public Sub sortArray1D(arr As Variant, Optional sortOrder As SORT_ORDER = SORT_ASCENDING)
'    Dim lowerArr() As Variant
'    Dim higherArr() As Variant
'    Dim baseValue As Variant
'    Dim lowIndex As Long
'    Dim highIndex As Long
'    Dim iRow As Long
'    Dim iLower As Long
'    Dim iHigher As Long
'
'
'    If dimensionsNumber(arr) <> 1 Then Exit Sub
'
'    lowIndex = LBound(arr, 1)
'    highIndex = UBound(arr, 1)
'
'    ReDim Preserve lowerArr(1 To highIndex - lowIndex)
'    ReDim Preserve higherArr(1 To highIndex - lowIndex)
'
'    If highIndex - lowIndex > 0 Then
'        For iRow = lowIndex + 1 To highIndex
'            If arr(iRow) < arr(1) Then
'                iLower = iLower + 1
'                lowerArr(iLower) = arr(iRow)
'            Else
'                iHigher = iHigher + 1
'                higherArr(iHigher) = arr(iRow)
'            End If
'        Next iRow
'
'        If iLower Then
'            ReDim Preserve lowerArr(lowIndex To iLower)
'            If iLower > 1 Then Call sortArray1D(lowerArr, sortOrder)
'        End If
'
'        If iHigher Then
'            ReDim Preserve higherArr(lowIndex To iHigher)
'            If iHigher > 1 Then Call sortArray1D(higherArr, sortOrder)
'        End If
'    End If
'
'
'    'Dim finalArray() As Variant
'    'ReDim Preserve finalArray(lowIndex To highIndex)
'    baseValue = arr(lowIndex)
'    iRow = lowIndex
'
'    If sortOrder = SORT_ASCENDING Then
'        Call subSortArray1D_insertValues(arr, lowerArr, iLower, iRow)
'    Else
'        Call subSortArray1D_insertValues(arr, higherArr, iHigher, iRow)
'    End If
'
'    arr(iRow) = baseValue
'    iRow = iRow + 1
'
'    If sortOrder = SORT_DESCENDING Then
'        Call subSortArray1D_insertValues(arr, lowerArr, iLower, iRow)
'    Else
'        Call subSortArray1D_insertValues(arr, higherArr, iHigher, iRow)
'    End If
'
'End Sub
'Private Sub subSortArray1D_insertValues(arr As Variant, partArray() As Variant, index As Long, iRow As Long)
'    Dim jRow As Long
'    If index Then
'        For jRow = 1 To index
'            arr(iRow) = partArray(jRow)
'            iRow = iRow + 1
'        Next jRow
'    End If
'End Sub
'
'
'
'
'
'Public Sub sortArray2D(arr As Variant, column As Integer, Optional sortOrder As SORT_ORDER = 0)
'    Dim orderArray() As Variant
'    Dim tempArray As Variant
'    Dim lRow As Long
'    Dim lCol As Long
'    Dim lIndex As Long
'
'
'    If dimensionsNumber(arr) <> 2 Then Exit Sub
'    If UBound(arr, 1) < column Then Exit Sub
'
'
'    ReDim Preserve orderArray(1 To 2, LBound(arr, 2) To UBound(arr, 2))
'    For lRow = LBound(arr, 2) To UBound(arr, 2)
'        orderArray(1, lRow) = lRow
'        orderArray(2, lRow) = arr(column, lRow)
'    Next lRow
'
'    Call subSortArray2D(orderArray, sortOrder)
'
'    tempArray = arr
'    For lRow = LBound(arr, 2) To UBound(arr, 2)
'        lIndex = orderArray(1, lRow)
'        For lCol = LBound(arr, 1) To UBound(arr, 1)
'            arr(lCol, lRow) = tempArray(lCol, lIndex)
'        Next lCol
'    Next lRow
'
'End Sub
'
'
'Public Sub subSortArray2D(arr() As Variant, Optional sortOrder As SORT_ORDER = SORT_ASCENDING)
'    Dim lowerArr() As Variant
'    Dim higherArr() As Variant
'    Dim lowIndex As Long
'    Dim highIndex As Long
'    Dim iRow As Long
'    Dim iLower As Long
'    Dim iHigher As Long
'    'Dim iRows As Long
'
'    lowIndex = LBound(arr, 2)
'    highIndex = UBound(arr, 2)
'    'iRows = highIndex - lowIndex
'
'    ReDim Preserve lowerArr(1 To 2, 1 To highIndex - lowIndex)
'    ReDim Preserve higherArr(1 To 2, 1 To highIndex - lowIndex)
'
'    If highIndex - lowIndex > 0 Then
'        For iRow = lowIndex + 1 To highIndex
'            If arr(2, iRow) < arr(2, 1) Then
'                iLower = iLower + 1
'                lowerArr(1, iLower) = arr(1, iRow)
'                lowerArr(2, iLower) = arr(2, iRow)
'            Else
'                iHigher = iHigher + 1
'                higherArr(1, iHigher) = arr(1, iRow)
'                higherArr(2, iHigher) = arr(2, iRow)
'            End If
'        Next iRow
'
'        If iLower Then
'            ReDim Preserve lowerArr(1 To 2, lowIndex To iLower)
'            If iLower > 1 Then Call subSortArray2D(lowerArr, sortOrder)
'        End If
'
'        If iHigher Then
'            ReDim Preserve higherArr(1 To 2, lowIndex To iHigher)
'            If iHigher > 1 Then Call subSortArray2D(higherArr, sortOrder)
'        End If
'
'    End If
'
'
'    Dim finalArray() As Variant
'    ReDim Preserve finalArray(1 To 2, lowIndex To highIndex)
'    iRow = lowIndex
'
'    If sortOrder = SORT_ASCENDING Then
'        Call subSortArray2D_insertValues(finalArray, lowerArr, iLower, iRow)
'    Else
'        Call subSortArray2D_insertValues(finalArray, higherArr, iHigher, iRow)
'    End If
'
'    finalArray(1, iRow) = arr(1, 1)
'    finalArray(2, iRow) = arr(2, 1)
'    iRow = iRow + 1
'
'    If sortOrder = SORT_DESCENDING Then
'        Call subSortArray2D_insertValues(finalArray, lowerArr, iLower, iRow)
'    Else
'        Call subSortArray2D_insertValues(finalArray, higherArr, iHigher, iRow)
'    End If
'
'    arr = finalArray
'
'End Sub
'Private Sub subSortArray2D_insertValues(finalArray() As Variant, partArray() As Variant, index As Long, iRow As Long)
'    Dim jRow As Long
'    If index Then
'        For jRow = 1 To index
'            finalArray(1, iRow) = partArray(1, jRow)
'            finalArray(2, iRow) = partArray(2, jRow)
'            iRow = iRow + 1
'        Next jRow
'    End If
'End Sub
'
'
'
'
'
'
'
'
'
'
'
'
'
'
'
'
'
'Public Sub sortDictionary(d As Dictionary, Optional sortOrder As SORT_ORDER = SORT_ASCENDING)
'    Dim arr() As Variant
'    Dim i As Long
'    Dim dictKey As Variant
'
'    On Error GoTo errHandler
'
'    ReDim Preserve arr(1 To 2, 1 To d.count)
'    For Each dictKey In d.Keys
'        i = i + 1
'        arr(1, i) = dictKey
'        arr(2, i) = d.item(dictKey)
'    Next dictKey
'
'    Call subSortArray2D(arr, sortOrder)
'    Set d = New Dictionary
'    For i = 1 To UBound(arr, 2)
'        Call d.add(arr(1, i), arr(2, i))
'    Next i
'
'    Exit Sub
'
'errHandler:
'    Debug.Print "S³ownik zawiera obiekty, których posortowanie jest niemo¿liwe"
'End Sub
