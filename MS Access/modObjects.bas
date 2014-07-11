Attribute VB_Name = "modObjects"
Option Compare Database
Option Explicit




'********************************************************************
'   Description:    Function to check if two variables points to the
'                   same object.
'********************************************************************
Public Function isTheSameObject(object1 As Object, object2 As Object) As Boolean
    If ObjPtr(object1) = ObjPtr(object2) Then isTheSameObject = True
End Function





Public Sub test()
    Dim col As New Collection
    Dim a As Object
    Dim b As Object
    Dim c As Adjustment
    Dim d As Object
    
    
    Set a = New Adjustment
    Call a.setCurrencyCode("a")
    Call col.Add(a)
    
    Set b = New Adjustment
    Call b.setCurrencyCode("b")
    Call col.Add(b)
    
    Set c = New Adjustment
    Call c.setCurrencyCode("c")
    Call col.Add(c)
    
    Set d = New Adjustment
    Call d.setCurrencyCode("d")
    Call col.Add(d, , , 1)
    
End Sub
