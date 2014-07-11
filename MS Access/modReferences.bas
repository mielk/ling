Attribute VB_Name = "modReferences"
Option Compare Database
Option Explicit

Private Const CLASS_NAME As String = "modReferences"




'********************************************************************
'   Description:    Adds references to Microsoft Scripting Runtime
'
'   Returns:        True - if reference has been added.
'                   False - if reference cannot be added.
'********************************************************************
Public Function loadScriptingRuntimeReference() As Boolean
    Const METHOD_NAME As String = "loadScriptingRuntimeReference"
    Const LIB_FILE_NAME As String = "scrrun.dll"
    Const REFERENCE_SHORT_NAME As String = "Scripting"
    '-----------------------------------------------------
    Dim strDLLFilePath As String
    '-----------------------------------------------------
    
    
    On Error GoTo FileNotFoundException
    
    
    'Removes current reference
    Call removeReference(REFERENCE_SHORT_NAME)
    
    
    'Add reference
    strDLLFilePath = getWindowsSystemFolderPath & LIB_FILE_NAME
    Call Access.References.AddFromFile(strDLLFilePath)
    
    loadScriptingRuntimeReference = True
        
        
        
    Exit Function
        
        
        
'-----------------------------------------------------
FileNotFoundException:
    If Err.Number = 29060 Then      'DLL file not found
        Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "DLL file not found")
    End If
End Function




'********************************************************************
'   Description:    Returns the reference with the specified name.
'
'   Parameters:
'       referenceName
'                   The name of a reference to be returned.
'
'   Returns:        Reference with the specified name or Nothing if
'                   reference with such a name doesn't exist.
'********************************************************************
Public Function getReference(referenceName As String) As Reference
    Const METHOD_NAME As String = "getReference"
    '-----------------------------------------------------
    
    On Error Resume Next
    Set getReference = Access.References.item(referenceName)
    
End Function



'********************************************************************
'   Description:    Prints all the references into Immediate window.
'********************************************************************
Public Sub printReferences()
    Const METHOD_NAME As String = "printReferences"
    '-----------------------------------------------------
    Dim ref As Reference
    '-----------------------------------------------------
    
    For Each ref In Access.References
        Debug.Print ref.Name & ": " & ref.FullPath
    Next ref
    
End Sub




'********************************************************************
'   Description:    Returns the reference with the specified path.

'   Parameters:
'       referencePath
'                   The path of a reference to be returned.
'
'   Returns:        Reference with the specified path or Nothing if
'                   reference with such a path doesn't exist.
'********************************************************************
Public Function getReferenceByPath(referencePath As String) As Reference
    Const METHOD_NAME As String = "getReferenceByPath"
    '-----------------------------------------------------
    Dim objReference As Reference
    '-----------------------------------------------------
    
    For Each objReference In Access.References
        If StrComp(objReference.FullPath, referencePath, vbTextCompare) = 0 Then
            Set getReferenceByPath = objReference
            Exit For
        End If
    Next objReference
    
End Function











'********************************************************************
'   Description:    Adds reference from the given file to MS Access.
'
'   Parameters:
'       referencePath
'                   Full path of the file to be added as a reference.
'
'   Returns:        True - if reference has been added succesfully.
'                   False - if reference could not be added.
'
'********************************************************************
Public Function addReference(referencePath As String) As Boolean
    Const METHOD_NAME As String = "addReference"
    '-----------------------------------------------------
    
    Debug.Print "Adding reference: " & referencePath

    With Access.References
        On Error GoTo Exception
        Call .AddFromFile(referencePath)
    End With
    
    
    'Prints result of adding reference.
    Debug.Print "Reference added - " & referencePath & ". Total number of references: " & Access.References.count
    addReference = True
    
    
    Exit Function
    
    
'-----------------------------------------------------
Exception:
    If Err.Number = 32813 Then          'Name conflicts with existing module, project, or object library
        Debug.Print "Reference already exists - " & referencePath & ". Total number of references: " & Access.References.count
    ElseIf Err.Number = 29060 Then      'File not found
        Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Reference cannot be added - " & referencePath)
        Call Err.Raise(Err.Number)
    End If
    
End Function







'********************************************************************
'   Description:    Removes all the broken references from MS Access.
'********************************************************************
Public Sub removeBrokenReferences()
    Const METHOD_NAME As String = "removeBrokenReferences"
    '-----------------------------------------------------
    Dim objRef As Reference
    '-----------------------------------------------------
    
    
    For Each objRef In Access.References
        Debug.Print objRef.Name & ";" & objRef.FullPath
        If objRef.IsBroken Then
        
            On Error Resume Next
            Call Access.References.Remove(objRef)
            
            'Prints result of remove operation.
            If Err.Number Then
                Debug.Print "It was impossible to remove reference " & objRef.FullPath
            Else
                Debug.Print "Broken reference " & objRef.FullPath & " has been removed"
            End If
            
        End If
    Next objRef
    
End Sub




'********************************************************************
'   Description:    Removes the given reference.
'
'   Note that some references are built into MS Access and cannot be removed.
'********************************************************************
Public Function removeReference(referenceName As String) As Boolean
    Const METHOD_NAME As String = "removeReference"
    '-----------------------------------------------------
    Dim objTempReference As Object
    '-----------------------------------------------------
    
    
    Set objTempReference = getReference(referenceName)
    
    If Not objTempReference Is Nothing Then
        On Error GoTo NonRemovableReferenceException
        Call Access.References.Remove(objTempReference)
        Debug.Print "Reference removed: " & referenceName & " | Total number of references: " & Access.References.count
    Else
        Debug.Print "Reference doesn't exist: " & referenceName & " | Total number of references: " & Access.References.count
    End If
    
    
    removeReference = True
    
    
    Exit Function
    
    
'-----------------------------------------------------
NonRemovableReferenceException:
    If Err.Number = 57101 Then
        Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Reference " & referenceName & " cannot be removed")
    End If
End Function





'********************************************************************
'   Description:    Removes given references from MS Access.
'
'   Parameters:
'       refToBeRemoved
'                   References to be removed. It can be an array or
'                   a string (with names separated with ;).
'
'********************************************************************
Public Sub removeReferences(refToBeRemoved As Variant)
    Const METHOD_NAME As String = "removeReferences"
    '-----------------------------------------------------
    Dim arrReferences As Variant
    Dim varName As Variant
    Dim objReference As Reference
    '-----------------------------------------------------
    
    
    'Converts given references into array.
    If IsArray(refToBeRemoved) Then
        arrReferences = refToBeRemoved
    Else
        If TypeName(refToBeRemoved) = "String" Then
            arrReferences = Split(refToBeRemoved, ";")
        Else
            GoTo IllegalArgumentException
        End If
    End If
    
    
    
    'Iterates through the references array and removes them.
    For Each varName In arrReferences
        Call removeReference(CStr(varName))
    Next varName
    
    
    Exit Sub
    
    
'-----------------------------------------------------
IllegalArgumentException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Illegal format of given argument [refToBeRemoved]: " & TypeName(refToBeRemoved) & "; Must be Array or String")
    
End Sub




'********************************************************************
'   Description:    Removes all references from MS Access.
'
'   Note that some references are built into MS Access and cannot
'   be removed.
'********************************************************************
Public Sub removeAllReferences()
    Const METHOD_NAME As String = "removeAllReferences"
    '-----------------------------------------------------
    Dim objRef As Reference
    '-----------------------------------------------------
    
    
    For Each objRef In Access.References
        Debug.Print objRef.Name & ";" & objRef.FullPath
        
        On Error Resume Next
        Call Access.References.Remove(objRef)
        
        'Prints results of remove operation.
        If Err.Number Then
            Debug.Print "It was impossible to remove reference " & objRef.FullPath
        Else
            Debug.Print "Reference " & objRef.FullPath & " has been removed"
        End If
        
    Next objRef

End Sub







'********************************************************************
'   Description:    Loads reference to Excel application.
'
'   Returns:
'       Boolean     True - if reference has been added successfully.
'                   False - if reference couldn't be added.
'********************************************************************
Public Function loadExcelReference() As Boolean
    Const METHOD_NAME As String = "loadExcelReference"
    '-----------------------------------------------------
    
    
    On Error GoTo ExcelNotFoundException
    
    Call Access.References.AddFromFile(getOfficeDir & "excel.exe")
    
    
    Exit Function
    
    
'-----------------------------------------------------
ExcelNotFoundException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Reference to Excel could not be loaded")
End Function





'********************************************************************
'   Description:    Loads reference to VBE application.
'
'   VBE references are being loaded separately from other references,
'   since it is necessary to take some additional actions when loading
'   them, like recognizing Office version.
'
'   Returns:
'       Boolean     True - if references has been added successfully.
'                   False - if references couldn't be added.
'********************************************************************
Private Function loadVBEReferences() As Boolean
    Const METHOD_NAME As String = "loadVBEReferences"
    '-----------------------------------------------------
    
    
    Call Access.References.AddFromFile(getVBALibFolderPath & "VBE" & getVBAVersionNumber & "EXT.OLB")
    loadVBEReferences = True
    
    
    Exit Function
    
    
'-----------------------------------------------------
LibraryFolderNotFoundException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when loading reference to VBE extension")
    
    
End Function






'********************************************************************
'   Description:    Loads specified references.
'
'   Returns:
'       Boolean     True - if references has been added successfully.
'                   False - if references couldn't be added.
'********************************************************************
Private Function loadReferences(referenceNames As Variant) As Boolean
    Const METHOD_NAME As String = "loadReferences"
    '-----------------------------------------------------
    Const LIB_FOLDER_PATH As String = "C:\ExcelAccess\lib\"
    '-----------------------------------------------------
    Dim objFSO As Object:                                       Set objFSO = CreateObject("Scripting.FileSystemObject")
    Dim arrReferences As Variant
    Dim varReferencePath As Variant
    Dim strErrors As String
    '-----------------------------------------------------
    
    
    
    'Checks if library folder exists and user has access to it.
    If Not objFSO.FolderExists(LIB_FOLDER_PATH) Then GoTo LibraryFolderNotFoundException
    
    
    
    'Converts given parameters string to array
    If IsArray(referenceNames) Then
        arrReferences = referenceNames
    Else
        arrReferences = Split(referenceNames, ";")
    End If
    
    
    
    'Iterates through the reference array and loads them
    On Error Resume Next
    For Each varReferencePath In arrReferences
        Call addReference(LIB_FOLDER_PATH & Trim(varReferencePath))
        If Err.Number Then
            strErrors = strErrors & varReferencePath & vbCrLf
        End If
    Next varReferencePath
    On Error GoTo 0
    
        

    'Checking for errors
    If Len(strErrors) Then
        Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when loading references." & Replace(strErrors, vbCrLf, ""))
        Call MsgBox(vbCrLf & "Error when loading references. The following references cannot be added: " & _
                    vbCrLf & strErrors)
    Else
        loadReferences = True
    End If
    
    
    Exit Function
    
    
'-----------------------------------------------------
LibraryFolderNotFoundException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "No access to lib\ folder")
    
    
End Function
