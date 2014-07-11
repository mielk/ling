Attribute VB_Name = "modErrors"
Option Compare Database
Option Explicit

Private Const CLASS_NAME As String = "modErrors"




Public Sub errorHandler(className As String, methodName As String, errorNumber As Long, _
                        errorDescription As String, detailedDescription As String)
    Dim username As String
    
    
    On Error GoTo NoUserException
    username = m.getCurrentUser.getLogin
    
    
NoUserException:
    If Len(username) = 0 Then username = getCurrentUser
    
    
    
    Debug.Print className & "; " & _
                methodName & "; " & _
                username & "; " & _
                errorNumber & "; " & _
                errorDescription & "; " & _
                detailedDescription
    
End Sub
