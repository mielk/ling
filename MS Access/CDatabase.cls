VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "CDatabase"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const CLASS_NAME As String = "CDatabase"
'-----------------------------------------------------
Private c As Object                 'ADODB.Connection
Private rs As Object                'ADODB.Recordset
Private pFilePath As String
'-----------------------------------------------------






'********************************************************************
'   Description:    Function to connect to the given Access
'                   database file.
'********************************************************************
Public Sub connect(DBFilePath As String)
    Const METHOD_NAME As String = "connect"
    '-----------------------------------------------------
    Dim connString As String
    '-----------------------------------------------------


    On Error GoTo NotConnectedException

    Set c = CreateObject("ADODB.Connection")            'Set c = New ADODB.Connection
    pFilePath = DBFilePath                              'Saving current DB file path
    connString = getOLEConnectionString(DBFilePath)
    Call c.Open(connString)


    If Err.number Then
        Call Err.clear
    
        connString = getConnectionString(DBFilePath)
        Call c.Open(connString)
    
        If Err.number Then
            GoTo NotConnectedException
        End If
    
    End If
    
            
            
    Exit Sub



'-----------------------------------------------------
NotConnectedException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when connecting to the database: " & connString)
    Call MsgBox("Error when connecting to the database")
    
    
End Sub




'********************************************************************
'   Description:    Reconnect to the current database.
'********************************************************************
Public Sub reconnect()
    Call connect(pFilePath)
End Sub





'********************************************************************
'   Description:    Function to return a connection string to the
'                   given Access database.
'********************************************************************
Private Function getConnectionString(DBFilePath As String) As String
    Const METHOD_NAME As String = "getConnectionString"
    '-----------------------------------------------------
'
'    getConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0; " & _
'                        "Data Source=" & DBFilePath & ";"

    getConnectionString = "Driver={Microsoft Access Driver (*.mdb)};" & _
                          "Dbq=" & DBFilePath & ";" & _
                          "Uid=admin;" & _
                          "Pwd="

End Function



'********************************************************************
'   Description:    Function to return a OLE connection string to the
'                   given Access database.
'********************************************************************
Private Function getOLEConnectionString(DBFilePath As String) As String
    Const METHOD_NAME As String = "getOLEConnectionString"
    '-----------------------------------------------------

    getOLEConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0; " & _
                        "Data Source=" & DBFilePath & ";"

End Function





'********************************************************************
'   Description:    Function to check if the connection is already open.
'********************************************************************
Private Function isOpenConnection() As Boolean
    Const METHOD_NAME As String = "isOpenConnection"
    '-----------------------------------------------------
    
    If Not c Is Nothing Then
        If c.State = 1 Then isOpenConnection = True
    End If
End Function






'********************************************************************
'   Description:    Function to execute the given SQL String without
'                   returning any Recordset.
'********************************************************************
Public Function execute(sqlString As String) As Boolean
    Const METHOD_NAME As String = "execute"
    '-----------------------------------------------------

    'Set rs = New ADODB.Recordset
    Set rs = CreateObject("ADODB.Recordset")
    
    
    'Try to connect to the database
    If Not isOpenConnection Then Call reconnect
        

    If isOpenConnection Then
        On Error GoTo SQLException
        Call rs.Open(sqlString, c) ', adOpenDynamic, adLockOptimistic)
        execute = True
    End If
    
    
'-----------------------------------------------------
ClearObjects:
    If rs.State Then Call rs.Close
    Set rs = Nothing
    Exit Function
    
    
'-----------------------------------------------------
SQLException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when executing SQL query: " & sqlString)
    GoTo ClearObjects
    
End Function









'********************************************************************
'   Description:    Function to get the Recordset based on the given
'                   SQL string.
'********************************************************************
Public Function getRecordset(sqlString As String) As Object
    Const METHOD_NAME As String = "getRecordset"
    '-----------------------------------------------------
    
    
    'Set getRecordset = New ADODB.Recordset
    Set getRecordset = CreateObject("ADODB.Recordset")
    
    
    'Try to connect to the database
    If Not isOpenConnection Then Call reconnect
    
    
    If isOpenConnection Then
        On Error GoTo SQLException
        Call getRecordset.Open(sqlString, c, adOpenDynamic, adLockReadOnly)
    End If
    
    
    Exit Function
    
    
    
'-----------------------------------------------------
SQLException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when executing SQL query: " & sqlString)

End Function





'********************************************************************
'   Description:    Function to get the VBA array based on the given
'                   SQL string.
'********************************************************************
Public Function getArray(sqlString As String, Optional addHeader As Boolean = True) As Variant()
    Const METHOD_NAME As String = "getArray"
    '-----------------------------------------------------
    Dim rs As Object:                   Set rs = getRecordset(sqlString)
    Dim varField As Variant             'Represents a single field in a single record.
    Dim lngRecord As Long
    Dim intColumn As Integer
    Dim arrTemp() As Variant
    Dim intColumnsCount As Integer
    '-----------------------------------------------------
    
            
    On Error GoTo Exception
    
        
    If Not rs Is Nothing Then
        intColumnsCount = rs.Fields.Count
        
        'Adding headers if required
        If addHeader Then
            lngRecord = 1
            ReDim Preserve arrTemp(1 To intColumnsCount, 1 To lngRecord)
            For Each varField In rs.Fields
                intColumn = intColumn + 1
                arrTemp(intColumn, 1) = varField.name
            Next varField
        End If
        

        'Adding records
        Do Until rs.EOF
            lngRecord = lngRecord + 1
            ReDim Preserve arrTemp(1 To intColumnsCount, 1 To lngRecord)
            For intColumn = 1 To intColumnsCount
                arrTemp(intColumn, lngRecord) = rs.Fields(intColumn - 1)
            Next intColumn
            Call rs.MoveNext
        Loop
        
        getArray = arrTemp()
        
    End If
    



'-----------------------------------------------------
ClearObjects:
    On Error Resume Next
    Call rs.Close
    Set rs = Nothing
    Exit Function


'-----------------------------------------------------
Exception:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when converting Recordset to VBA array")
    GoTo ClearObjects
    
End Function





'********************************************************************
'   Description:    Begin SQL transaction in this Connection.
'********************************************************************
Public Sub beginTransaction()
    Const METHOD_NAME As String = "beginTransaction"
    '-----------------------------------------------------
    
    If Not isOpenConnection Then Call reconnect
    If Not isOpenConnection Then GoTo ConnectionException
    
    Call c.beginTrans
    Exit Sub
    
'-----------------------------------------------------
ConnectionException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "It was impossible to connect to the database " & pFilePath)
    
End Sub



'********************************************************************
'   Description:    Commit the current SQL transaction.
'********************************************************************
Public Sub commitTransaction()
    Const METHOD_NAME As String = "commitTransaction"
    '-----------------------------------------------------
    
    'Try to connect to the database
    If Not isOpenConnection Then GoTo NoActiveConnectionException
    
    Call c.commitTrans
    Exit Sub
    
'-----------------------------------------------------
NoActiveConnectionException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "There is no active database connection")
    Exit Sub
    
TransactionCommitException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when committing transaction")
    
End Sub




'********************************************************************
'   Description:    Rollback the current SQL transaction.
'********************************************************************
Public Sub rollbackTransaction()
    Const METHOD_NAME As String = "rollbackTransaction"
    '-----------------------------------------------------
    
    'Try to connect to the database
    If Not isOpenConnection Then GoTo NoActiveConnectionException
    
    Call c.rollbackTrans
    Exit Sub
    
'-----------------------------------------------------
NoActiveConnectionException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "There is no active database connection")
    Exit Sub
    
TransactionRollbackException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.number, Err.description, "Error when rolling transaction back")
    
End Sub



