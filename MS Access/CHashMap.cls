VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "CHashMap"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit


Implements ICollection



Private Const CLASS_NAME As String = "CHashMap"
'-----------------------------------------------------
Private pItems As Object ' Dictionary
Private pName As String



Private Sub Class_Initialize()
    Set pItems = CreateObject("Scripting.Dictionary") 'New Dictionary
End Sub



'********************************************************************
'   SETTER/BUILDER METHODS
'********************************************************************
Public Function name(value As String) As CHashMap
    Set name = Me
    pName = value
End Function

'********************************************************************
'   SETTER METHODS
'********************************************************************
Public Sub setName(name As String)
    pName = name
End Sub


'********************************************************************
'   GETTER METHODS
'********************************************************************
Public Function getName() As String
    getName = pName
End Function






'********************************************************************
'   Description:    Function to return the number of items stored in
'                   this collection.
'********************************************************************
Public Function Count() As Long
    Count = pItems.Count
End Function
Private Function ICollection_count() As Long                            'Required to implement interface ICollection
    ICollection_count = Count
End Function



'********************************************************************
'   Description:    Function to check if this collection is empty.
'********************************************************************
Public Function isEmpty() As Boolean
    If pItems.Count = 0 Then isEmpty = True
End Function



'********************************************************************
'   Description:    Function to return all the items stored in this
'                   collection.
'********************************************************************
Public Function getItems() As Collection
    Const METHOD_NAME As String = "getItems"
    '--------------------------------------------
    Dim varKey As Variant
    '--------------------------------------------
    
    Set getItems = New Collection
    For Each varKey In pItems.Keys
        Call getItems.Add(pItems.item(varKey))
    Next varKey
    
End Function
Private Function ICollection_getItems() As Collection                   'Required to implement interface ICollection
    Set ICollection_getItems = getItems()
End Function




'********************************************************************
'   Description:    Function to return all the items stored in this
'                   collection as a map.
'********************************************************************
Public Function getItemsMap() As Object 'Dictionary
    Set getItemsMap = pItems
End Function





'********************************************************************
'   Description:    Function to add item to this collection.
'
'   Parameters:
'       item        Item to be added to this collection.
'       key         Key which this item is added with. This is optional parameter.
'                   If it is ommitted the value of item.getKey method is taken
'                   as the key for this entry.
'
'   Returns:        True - if item has been added successfully.
'                   False - if any error occured while adding a new item.
'********************************************************************
Public Function addItem(item As ICollectionItem, Optional key As Variant) As Boolean
    Const METHOD_NAME As String = "addItem"
    '-----------------------------------------------------
    Dim varKey As Variant
    '-----------------------------------------------------
    
    On Error GoTo AddItemException
    
    
    If IsObject(key) Then
        Set varKey = key
    Else
        If IsMissing(key) Then
            varKey = item.getProperty(propertyName.key)
        Else
            If Len(key) Then varKey = key Else varKey = item.getProperty(propertyName.key)
        End If
    End If
    
    
    
    Call pItems.Add(varKey, item)
    addItem = True
    
    
    Exit Function


'-----------------------------------------------------
AddItemException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.Description, "Error when adding a new item to the collection " & pName)

End Function






'********************************************************************
'   Description:    Function to add all the items from the given
'                   collection into this one.
'   Returns:        True - if all the items have been added successfully.
'********************************************************************
Public Function addAll(c As ICollection) As Boolean
    Const METHOD_NAME As String = "addAll"
    '--------------------------------------
    Dim obj As ICollectionItem
    
    
    On Error Resume Next
    
    
    addAll = True                           'Value of this function is set to True by default.
    
    For Each obj In c.getItems
        Call pItems.Add(obj.getProperty(propertyName.key), obj)
        If Err.number Then
            Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.Description, "Error when adding a new item to the collection " & pName)
            addAll = False
        End If
    Next obj
    
    
End Function




'********************************************************************
'   Description:    Function to add all the items from the given
'                   hashmap into this one.
'   Returns:        True - if all the items have been added successfully.
'********************************************************************
Public Function addMap(map As CHashMap) As Boolean
    Const METHOD_NAME As String = "addMap"
    '--------------------------------------
    Dim obj As Object
    Dim dict As Object ' Dictionary
    Dim varKey As Variant
    '--------------------------------------
    
    
    On Error Resume Next
    
    
    addMap = True                           'Value of this function is set to True by default.
    
    dict = map.getItems
    For Each varKey In dict.Keys
        Call pItems.Add(varKey, dict.items(varKey))
        If Err.number Then
            Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.Description, "Error when adding a new item to the collection " & pName)
            addMap = False
        End If
    Next varKey
    
End Function






'********************************************************************
'   Description:    Function to return the item with the specified key
'                   within this collection.
'   Returns:        Object with the specified key in this collection.
'                   [Nothing] if the given key doesn't exist in this map.
'********************************************************************
Public Function getItem(key As Variant) As Object
    Const METHOD_NAME As String = "getItem"
    '--------------------------------------
    
    If pItems.exists(key) Then
        Set getItem = pItems.item(key)
    End If
    
End Function




'********************************************************************
'   Description:    Removes all the items from this collection.
'********************************************************************
Public Sub clear()
    Call pItems.removeAll
    'Set pItems = New Dictionary
End Sub
Private Sub ICollection_clear()                             'Required to implement interface ICollection
    Call clear
End Sub



'********************************************************************
'   Description:    Function to remove an item with the given key
'                   within the collection.
'********************************************************************
Public Sub remove(key As Variant)
    Const METHOD_NAME As String = "remove"
    '--------------------------------------
    
    If pItems.exists(key) Then
        Call pItems.remove(key)
    End If
    
End Sub




'********************************************************************
'   Description:    Function to remove the given item, if exists, from
'                   this collection.
'********************************************************************
Public Sub removeItem(obj As Object)
    Const METHOD_NAME As String = "removeItem"
    '------------------------------------
    Dim varKey As Variant
    '------------------------------------
    
    For Each varKey In pItems.Keys
        If isTheSameObject(pItems.item(varKey), obj) Then
            Call pItems.remove(varKey)
        End If
    Next varKey
    
End Sub




'********************************************************************
'   Description:    Returns the clone of this collection.
'********************************************************************
Public Function clone() As CHashMap
    Const METHOD_NAME As String = "clone"
    '------------------------------------
    
    Set clone = New CHashMap
    With clone
        Call .setName(pName)
        Call .addMap(Me)
    End With

End Function




'********************************************************************
'   Description:    This method removes from this collection all the
'                   items existing in the given subcollection.
'
'   Performance:    Deleting 10'000 items from the collection of 100'000 items: 12.66s
'                   Deleting    100 items from the collection of 100'000 items:  0.17s
'********************************************************************
Public Sub removeAll(subcollection As ICollection)
    Const METHOD_NAME As String = "removeAll"
    '------------------------------------
    Dim colTemp As Object:                      Set colTemp = CreateObject("Scripting.Dictionary") ' New Dictionary
    Dim objectsMap As Object:                   Set objectsMap = CreateObject("Scripting.Dictionary") ' New Dictionary
    Dim objItem As Object
    Dim varKey As Variant
    '------------------------------------
    
    'Creating a map of all objects stored in this collection with ptrObj as a key
    For Each objItem In subcollection.getItems
        On Error Resume Next    'If such a key already exists in this Dictionary, it should be just skipped.
        Call objectsMap.Add(ObjPtr(objItem), objItem)
        On Error GoTo 0
    Next objItem
    
    
    'Iterating through the given subcollection and removing objects existing in this
    'collection from the map.
    For Each varKey In pItems.Keys
        Set objItem = pItems.item(varKey)
        If Not objectsMap.exists(ObjPtr(objItem)) Then
            Call colTemp.Add(varKey, objItem)
        End If
    Next varKey
    
    
    Set pItems = colTemp
    

End Sub




'********************************************************************
'   Description:    This method removes from this map all the
'                   items existing in the given submap.
'********************************************************************
Public Sub removeKeys(submap As CHashMap)
    Const METHOD_NAME As String = "removeKeys"
    '------------------------------------
    Dim colTemp As Object:                      Set colTemp = CreateObject("Scripting.Dictionary") ' New Dictionary
    Dim objItem As Object
    Dim varKey As Variant
    '------------------------------------
    
    
    'Iterating through the given subcollection and removing
    'objects existing in this collection from the map.
    For Each varKey In submap.getItemsMap.Keys
        If pItems.exists(varKey) Then
            Call pItems.remove(varKey)
        End If
    Next varKey
    

End Sub




'********************************************************************
'   Description:    This method removes all the item having the
'                   specified property equal to the specified value.
'********************************************************************
Public Sub removeByValue(property As propertyName, value As Variant)
    Const METHOD_NAME As String = "removeByValue"
    '------------------------------------
    Dim varKey As Variant
    Dim objItem As ICollectionItem
    Dim tempDict As Object:                          Set tempDict = CreateObject("Scripting.Dictionary") ' New Dictionary
    '------------------------------------
    
    For Each varKey In pItems.Keys
        Set objItem = pItems.item(varKey)
        If objItem.getProperty(property) <> value Then
            Call tempDict.Add(varKey, objItem)
        End If
    Next varKey
    
    Set pItems = tempDict
    
End Sub



'********************************************************************
'   Description:    This method returns a set of all items from this
'                   Collection that don't exist in the given subcollection.
'********************************************************************
Private Function subtract(submap As CHashMap) As CHashMap
    Const METHOD_NAME As String = "subtract"
    '------------------------------------
    
    Set subtract = Me.clone
    Call subtract.removeKeys(submap)
    
End Function




'********************************************************************
'   Description:    Checks if the given object exists in this Collection.
'********************************************************************
Public Function objectExists(obj As Object) As Boolean
    Const METHOD_NAME As String = "objectExists"
    '------------------------------------
    Dim objItem As Object
    '------------------------------------
    
    For Each objItem In pItems
        If isTheSameObject(objItem, obj) Then
            objectExists = True
            Exit For
        End If
    Next objItem
    
End Function




'********************************************************************
'   Description:    Checks if the given key exists in this Collection.
'********************************************************************
Public Function keyExists(key As Variant) As Boolean
    Const METHOD_NAME As String = "keyExists"
    '------------------------------------
    
    keyExists = pItems.exists(key)
    
End Function






'********************************************************************
'   Description:    This method return a map of all items
'                   having the specified property equal to the
'                   specified value.
'********************************************************************
Public Function getItemsByValue(property As propertyName, value As Variant) As CHashMap
    Const METHOD_NAME As String = "getItemsByValue"
    '------------------------------------
    Dim varKey As Variant
    Dim objItem As ICollectionItem
    '------------------------------------
    
    Set getItemsByValue = New CHashMap
    
    For Each varKey In pItems.Keys
        Set objItem = pItems.item(varKey)
        If objItem.getProperty(property) = value Then
            Call getItemsByValue.addItem(objItem, varKey)
        End If
    Next varKey
    
End Function


'fillList
'fillMultiColumnList
'sort



'========= USER FORM OPERATIONS ========
'********************************************************************
'   Description:    This method fills the given list with the items
'                   from this Collection.
'                   The property given as an initial parameter is used
'                   as a label.
'   Parameters:
'       list        List to be populated with the items from this Collection.
'       property    Name of property which representing a single item
'                   in the list.
'       clearList   Optional parameter. Determins if list should be
'                   cleared before adding items from this Collection.
'********************************************************************
'Public Sub fillList(list As Object, property As PropertyName, _
'                    Optional clearList As Boolean = True)
'    Dim objItem As ICollectionItem
'    Dim v As Variant
'
'    With list
'        If clearList Then Call .clear
'        For Each o In pItems
'            v = getValue(o, property)
'            Call .addItem(v)
'        Next o
'    End With
'End Sub


''*** fills multi-column list with items stored in this collection
'Public Sub fillMultiColumnList(list As Object, mainValue As String, _
'                ParamArray properties() As Variant)
'    Dim bScreen As Boolean, bEvents As Boolean: Call changeSettings(bScreen, bEvents)
'    Dim v As Variant
'    Dim o As Object
'    Dim property As Variant
'    Dim mCol As Integer         'column number
'    Dim nRow As Long            'row number
'
'    On Error GoTo errHandler
'
'    Call list.clear
'    For Each o In pItems
'        'adds item [o] to list with value of property specified as [mainValue]
'        v = getValue(o, mainValue)
'        Call list.addItem(v)
'
'        'adds remaining properties of item [o] to list
'        mCol = 1
'        For Each property In properties
'            v = getValue(o, CStr(property))
'            list.list(nRow, mCol) = v
'            mCol = mCol + 1
'        Next property
'
'        nRow = nRow + 1
'    Next o
'
'errHandler:
'    Call restoreSettings(bScreen, bEvents)
'    Call errHandler("")
'End Sub







'********************************************************************
'   Description:    This method returns a subcollection of items from
'                   this Collection. Item is added to the result
'                   subcollection if the value of given property of this
'                   item contains the specified substring.
'
'   Parameters:
'       property    Name of property being checked.
'       substring   Determines what substring must exist in an item property value
'                   to include this item in the result subcollection.
'       isCaseSensitive
'                   Optional parameter.Determines if letters are case-sensitive
'                   while searching.
'
'   Example:
'       Let's assume that given is the collection of Country objects.
'       If this method is called with the following parameters:
'           property = PropertyName.Capital
'           substring = "a"
'       only countries will be returned with capital containing 'a' letter in its name.
'********************************************************************
Public Function containing(property As propertyName, substring As String, _
                            Optional isCaseSensitive As VbCompareMethod = vbBinaryCompare) As CHashMap
    Const METHOD_NAME As String = "containing"
    '-----------------------------------------
    Dim varKey As Variant
    Dim objItem As ICollectionItem
    Dim propertyValue As Variant
    '-----------------------------------------
    
    
    Set containing = New CArrayList
    
    For Each varKey In pItems.Keys
        Set objItem = pItems.item(varKey)
        propertyValue = objItem.getProperty(property)
        If InStr(1, propertyValue, substring, isCaseSensitive) Then
            Call containing.addItem(objItem, varKey)
        End If
    Next varKey
    
End Function




'********************************************************************
'   Description:    Returns String representation of this Collection.
'                   String representation consists of the default property
'                   value for all items separated with commas.
'********************************************************************
Public Function toString() As String
    Const METHOD_NAME As String = "toString"
    Const SEPARATOR_CHAR As String = ","
    '-----------------------------------------
    Dim objItem As Variant
    '-----------------------------------------
    
    
    For Each objItem In pItems.items
        toString = toString & objItem.getProperty(propertyName.None) & SEPARATOR_CHAR
    Next objItem
    
    toString = Left$(toString, Len(toString) - Len(SEPARATOR_CHAR))
    
End Function




'********************************************************************
'   Description:    Converts this hash map into array list.
'********************************************************************
Public Function toArrayList() As CArrayList
    Const METHOD_NAME As String = "toArrayList"
    '-----------------------------------------
    Dim objItem As Variant
    Dim iItem As ICollectionItem
    '-----------------------------------------
    
    Set toArrayList = newArrayList
    
    For Each objItem In pItems.items
        Set iItem = objItem
        Call toArrayList.addItem(iItem)
    Next objItem
    
End Function



'********************************************************************
'   Description:    This method returns an array representing selected
'                   properties of all the items stored in this Collection.
'********************************************************************
Public Function toArray(hasHeaderRow As Boolean, ParamArray properties() As Variant) As Variant
    Const METHOD_NAME As String = "toArray"
    '-----------------------------------------
    Dim objItem As Variant
    Dim arrTemp() As Variant
    Dim lngRow As Long
    Dim lngRowsCount As Long:           If hasHeaderRow Then lngRowsCount = pItems.Count + 1 Else lngRowsCount = pItems.Count
    Dim intColumn As Integer
    Dim intColumnsCount As Integer
    Dim varProperty As Variant
    '-----------------------------------------


    'No column was declared when calling this function.
    If UBound(properties) = -1 Then GoTo NoColumnException
    


    intColumnsCount = UBound(properties) + 1
    ReDim arrTemp(1 To intColumnsCount, 1 To lngRowsCount)
    
    
    'Adding header row
    If hasHeaderRow Then
        lngRow = lngRow + 1
        intColumn = 0
        For Each varProperty In properties
            intColumn = intColumn + 1
            arrTemp(intColumn, lngRow) = getPropertyName(CInt(varProperty))
        Next varProperty
    End If
    
    
    'Adding data rows
    For Each objItem In pItems.items
        lngRow = lngRow + 1
        intColumn = 0
        For Each varProperty In properties
            intColumn = intColumn + 1
            arrTemp(intColumn, lngRow) = objItem.getProperty(CInt(varProperty))
        Next varProperty
    Next objItem
    
    
    toArray = arrTemp


    Exit Function


'-----------------------------------------
NoColumnException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.Description, "No column was declared when calling this function.")
    

End Function




'********************************************************************
'   Description:    This method sorts this collection by the given
'                   property in the given order.
'
'   Parameters:
'       property    Name of property by which this collection is to be sorted.
'       isAscending Determines the order in which this collection should be
'                   sorted.
'********************************************************************
Public Sub sort(property As propertyName, Optional isAscending As Boolean = True)
    
End Sub


'sortText


''*** select items from this collection on list [list]
'Public Sub selectOnList(list As Object)
'    Dim n As Integer
'
'    For n = 0 To list.ListCount - 1
'        If exists(list.list(n)) Then
'            list.Selected(n) = True
'        End If
'    Next n
'End Sub
'
'
''*** add to this collection items selected on list [list]
'Public Sub addItemsFromList(list As Object, c As TCollection)
'    Dim n As Long
'    Dim o As Object
'
'    Set pItems = New collection
'    For n = 0 To list.ListCount - 1
'        If list.Selected(n) Then
'            Set o = c.getByKey(list.list(n))
'            Call add(o)
'        End If
'    Next n
'End Sub
'
'
'''*** prints this collection to sheet
''Public Sub printToSheet(column As Integer)
''    Dim arr() As String
''    Dim i As Integer
''    Dim o As Object
''
''    For Each o In pItems
''        i = i + 1
''        ReDim Preserve arr(i)
''        arr(i) = o.name
''    Next
''
''    '!! printuj do arkusza
''
''End Sub
'
'
'
''*** returns items having value of [property] starting with specified string
'Public Function startingWith(str As String, property As String) As TCollection
'    Dim o As Object
'    Dim Name As String
'    Dim i As Byte
'
'    Set startingWith = newTCollection.hasKey(pHasKey)
'    i = Len(str)
'
'    '## If there is no filter every item is added.
'    If Len(str) = 0 Then
'        For Each o In pItems
'            Call startingWith.add(o)
'        Next o
'        Exit Function
'    End If
'
'    '## If any filter is set each item is checked before being added to collection.
'    For Each o In pItems
'        Name = getValue(o, property)
'        If LCase(Left(Name, i)) = LCase(str) Then
'            Call startingWith.add(o)
'        End If
'    Next o
'End Function







Private Sub Class_Terminate()
    Set pItems = Nothing
End Sub




