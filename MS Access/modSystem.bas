Attribute VB_Name = "modSystem"
Option Compare Database
Option Explicit


#If VBA7 Then
    Private Declare PtrSafe Function GetWindowsDirectory Lib "kernel32" Alias "GetWindowsDirectoryA" (ByVal lpBuffer As String, ByVal nSize As Long) As Long
    Private Declare PtrSafe Function GetLocaleInfo Lib "kernel32" Alias "GetLocaleInfoA" (ByVal Locale As Long, ByVal LCType As Long, ByVal lpLCData As String, ByVal cchData As Long) As Long
    Private Declare PtrSafe Function SetLocaleInfo Lib "kernel32" Alias "SetLocaleInfoA" (ByVal Locale As Long, ByVal LCType As Long, ByVal lpLCData As String) As Boolean
    Private Declare PtrSafe Function GetUserName Lib "advapi32.dll" Alias "GetUserNameA" (ByVal lpBuffer As String, nSize As Long) As Long
    Private Declare PtrSafe Function SetCurrentDirectory Lib "kernel32" Alias "SetCurrentDirectoryA" (ByVal lpPathName As String) As Long
    Private Declare PtrSafe Function GetUserDefaultLCID% Lib "kernel32" ()
#Else
    Private Declare Function GetWindowsDirectory Lib "kernel32" Alias "GetWindowsDirectoryA" (ByVal lpBuffer As String, ByVal nSize As Long) As Long
    Private Declare Function GetLocaleInfo Lib "kernel32" Alias "GetLocaleInfoA" (ByVal Locale As Long, ByVal LCType As Long, ByVal lpLCData As String, ByVal cchData As Long) As Long
    Private Declare Function SetLocaleInfo Lib "kernel32" Alias "SetLocaleInfoA" (ByVal Locale As Long, ByVal LCType As Long, ByVal lpLCData As String) As Boolean
    Private Declare Function GetUserName Lib "advapi32.dll" Alias "GetUserNameA" (ByVal lpBuffer As String, nSize As Long) As Long
    Private Declare Function SetCurrentDirectory Lib "kernel32" Alias "SetCurrentDirectoryA" (ByVal lpPathName As String) As Long
    Private Declare Function GetUserDefaultLCID% Lib "kernel32" ()
#End If




Private Const CLASS_NAME As String = "modSystem"




Public Enum LOCALE_SETTING
    LOCALE_COUNTRY = &H6                'Country
    LOCALE_LANGUAGE = &H2               'Language
    LOCALE_ENG_COUNTRY_NAME = &H1002    'English name of country
    LOCALE_ENG_LANGUAGE_NAME = &H1001   'English name of language
    LOCALE_NATIVE_LANGUAGE_NAME = &H4   'Native name of language
    LOCALE_NATIVE_COUNTRY_NAME = &H8    'Native name of country
    LOCALE_CURRENCY_SYMBOL = &H14       'Currency symbol
    LOCALE_DECIMAL_SEPARATOR = &HE      'Decimal separator
    LOCALE_THOUSAND = &HF               'Thousand separator
    LOCALE_DATE_SEPARATOR = &H1D        'Date separator
    LOCALE_TIME_SEPARATOR = &H1E        'Time separator
End Enum






'********************************************************************
'   Description:    Returns the Windows directory path.
'********************************************************************
Public Function getWindowsDir() As String
    Dim strBuf As String * 256
    Dim lngLength As Long
    '-----------------------------------------------------
    
    lngLength = GetWindowsDirectory(strBuf, Len(strBuf))
    getWindowsDir = VBA.Trim$(VBA.Left$(strBuf, lngLength)) & "\"
End Function





'********************************************************************
'   Description:    Returns the path of Windows system folder
'                   There are different system folder paths depending
'                   on Windows version:
'                   - windows\System32\ for 32-bit Windows,
'                   - windows\SysWOW64\ for 64-bit Windows.
'********************************************************************
Public Function getWindowsSystemFolderPath() As String
    Dim arrPaths As Variant:            arrPaths = Array("SysWOW64", "System32")
    Dim strWindowsDir As String:        strWindowsDir = getWindowsDir
    Dim varWindowsPath As Variant
    Dim strTempPath As String
    Dim objWinSysFolder As Object
    '-----------------------------------------------------
    
    For Each varWindowsPath In arrPaths
        strTempPath = strWindowsDir & varWindowsPath & "\"
        Set objWinSysFolder = getFolderObject(strTempPath)
        If Not objWinSysFolder Is Nothing Then
            getWindowsSystemFolderPath = strTempPath
            Exit For
        End If
    Next varWindowsPath
End Function




'********************************************************************
'   Description:    Returns the path of Program Files folder.
'                   It depends on Windows' version:
'                   - C:\Program Files\             for 32-bit Windows,
'                   - C:\Program Files (x86)\       for 64-bit Windows.
'********************************************************************
Public Function getProgramFilesDir() As String
    Dim arrPaths As Variant:            arrPaths = Array("Program Files (x86)", "Program Files")
    Dim objFSO As Object:               Set objFSO = CreateObject("Scripting.FileSystemObject")
    Dim strWindowsDriver As String:     strWindowsDriver = Left$(getWindowsDir, 1)
    Dim varPath As Variant
    Dim objTempFolder As Object
    Dim strTempPath As String
    '-----------------------------------------------------
    
    For Each varPath In arrPaths
        strTempPath = strWindowsDriver & ":\" & varPath & "\"
        
        On Error GoTo errHandler
        Set objTempFolder = objFSO.getFolder(strTempPath)
        
errHandler:
        If Not objTempFolder Is Nothing Then
            getProgramFilesDir = strTempPath
            Exit For
        End If
    Next varPath
    
End Function



'*********************************************************************
'   Description:    Returns MS Office main folder.
'********************************************************************
Public Function getOfficeDir() As String
    getOfficeDir = SysCmd(acSysCmdAccessDir)
End Function




'********************************************************************
'   Description:    Returns a name of the Office folder.
'********************************************************************
Public Function getOfficeFolderName() As String
    Dim objOfficeFolder As Object:      Set objOfficeFolder = getFolderObject(getOfficeDir)
    '-----------------------------------------------------
    
    If Not objOfficeFolder Is Nothing Then
        getOfficeFolderName = objOfficeFolder.Name & "\"
    Else
        Debug.Print "Error while retrieving Office folder name"
    End If
    
End Function




'********************************************************************
'   Description:    Returns a folder with specified path as an instance of Object class.
'
'   Parameters:
'       path        Path of the folder to be returned.
'
'   Returns:        Folder with the specified path.
'                   Nothing if folder with such a path doesn't exist.
'
'********************************************************************
Public Function getFolderObject(path As String) As Object
    Dim objFSO As Object:               Set objFSO = CreateObject("Scripting.FileSystemObject")
    '-----------------------------------------------------
    
    On Error Resume Next
    Set getFolderObject = objFSO.getFolder(path)
End Function




'********************************************************************
'   Description:    Returns a file with specified path as an instance of Object class.
'
'   Parameters:
'       path        Path of the file to be returned.
'
'   Returns:        File with the specified path.
'                   Nothing if file with such a path doesn't exist.
'
'********************************************************************
Public Function getFileObject(path As String) As Object
    Dim objFSO As Object:               Set objFSO = CreateObject("Scripting.FileSystemObject")
    '-----------------------------------------------------
    
    On Error Resume Next
    Set getFileObject = objFSO.GetFile(path)
End Function




'********************************************************************
'   Description:    Returns the path of the folder with VBA DLL libraries.
'
'********************************************************************
Public Function getVBALibFolderPath() As String
    Const VBA_REFERENCE_NAME As String = "VBA"
    '-----------------------------------------------------
    Dim objRef As Reference
    Dim objVBADLLFile As Object
    '-----------------------------------------------------
    
    Set objRef = getReference(VBA_REFERENCE_NAME)
    If Not objRef Is Nothing Then
        Set objVBADLLFile = getFileObject(objRef.FullPath)
        If Not objVBADLLFile Is Nothing Then
            getVBALibFolderPath = objVBADLLFile.parentFolder
        End If
    End If
End Function




'********************************************************************
'   Description:    Returns the number of the current VBA version.
'
'   Returns:        Integer. The number of current VBA version.
'                   If no VBA library was found, 0 is returned.
'********************************************************************
Public Function getVBAVersionNumber() As Integer
    Const VBA_REFERENCE_NAME As String = "VBA"
    '-----------------------------------------------------
    Dim objRef As Reference
    Dim objVBADLLFile As Object
    '-----------------------------------------------------
    
    
    Set objRef = getReference(VBA_REFERENCE_NAME)
    If Not objRef Is Nothing Then
        Set objVBADLLFile = getFileObject(objRef.FullPath)
        If Not objVBADLLFile Is Nothing Then
            getVBAVersionNumber = Right$(objVBADLLFile.parentFolder.Name, 1)
        End If
    End If
End Function





'********************************************************************
'   Description:    Returns a specified regional setting of Windows.
'
'   Parameter:
'     settingType   Determines what type of regional setting should be
'                   returned. It has to be one of LOCALE_SETTING enum.
'
'   Returns:        Integer. The number of current VBA version.
'                   If no VBA library was found, 0 is returned.
'********************************************************************
Public Function getRegionalSetting(settingType As LOCALE_SETTING) As String
    Const LOCALE_USER_DEFAULT = &H400
    '-----------------------------------------------------
    Dim strBuffer As String
    Dim strTemp As String
    '-----------------------------------------------------
    
    strBuffer = String$(256, 0)
    strTemp = GetLocaleInfo(LOCALE_USER_DEFAULT, settingType, strBuffer, Len(strBuffer))
    If strTemp > 0 Then
        getRegionalSetting = Left$(strBuffer, strTemp - 1)
    Else
        getRegionalSetting = ""
    End If
End Function




'********************************************************************
'   Description:    Function to get the current logged on user in Windows.
'********************************************************************
Public Function getCurrentUser() As String
    Dim strBuf As String * 256
    Dim l As Long
    Dim lngLength As Long
    '-----------------------------------------------------
    
    lngLength = GetUserName(strBuf, Len(strBuf) - 1)
    getCurrentUser = Left$(strBuf, InStr(strBuf, Chr(0)) - 1)

End Function




'********************************************************************
'   Description:    Function to check if a file exists.
'********************************************************************
Public Function fileExists(filepath As String) As Boolean
    Static objFSO As Object
    '-----------------------------------------------------
    
    If objFSO Is Nothing Then Set objFSO = CreateObject("Scripting.FileSystemObject")
    fileExists = objFSO.fileExists(filepath)
End Function





'**************************************************************************
' Name:       getFileExtension
'
' Comment:    Returns the file extension from a given filepath.
'
' Parameters:
'   filepath  Path of a file which extension is to be returned.
'
' Returns:
'   String    Extension of a given file.
'             If the given parameter filepath is not a proper access path
'             an empty String is returned.
'**************************************************************************
Public Function getFileExtension(filepath As String) As String
    Dim lastDot As Integer

    lastDot = InStrRev(filepath, ".")
    If lastDot Then getFileExtension = MID$(filepath, lastDot + 1)
End Function




'**************************************************************************
' Name:       getFileNameFromFullPath
'
' Comment:    Returns the file name from a given filepath.
'
' Parameters:
'   filepath  Path of a file which name is to be returned.
'
' Returns:
'   String    The name of a given file.
'             If the given parameter filepath is not a proper access path
'             an empty String is returned.
'**************************************************************************
Public Function getFileNameFromFullPath(filepath As String) As String
    Const METHOD_NAME As String = "getFileNameFromFullPath"
    '-----------------------------------------------------
    Dim lastSlash As Integer
    Dim lastDot As Integer
    '-----------------------------------------------------
    
    lastSlash = InStrRev(filepath, "\")
    lastDot = InStrRev(filepath, ".")
    
    
    On Error GoTo IllegalFilePathException
    getFileNameFromFullPath = MID$(filepath, lastSlash + 1, lastDot - lastSlash - 1)
    
    
    Exit Function
    
    
'-----------------------------------------------------
IllegalFilePathException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Illegal file path: " & filepath)
    
End Function




'**************************************************************************
' Name:       getFileNameAndExtension
'
' Comment:    Returns the file name and extension from a given filepath.
'
' Parameters:
'   filepath  Path of a file which name is to be returned.
'
' Returns:
'   String    The name and the extenstion of a given file.
'             If the given parameter filepath is not a proper access path
'             an empty String is returned.
'**************************************************************************
Public Function getFileNameAndExtension(filepath As String) As String
    Const METHOD_NAME As String = "getFileNameAndExtension"
    '-----------------------------------------------------
    Dim lastSlash As Integer
    '-----------------------------------------------------
    
    lastSlash = InStrRev(filepath, "\")
    
    On Error GoTo IllegalFilePathException
    getFileNameAndExtension = MID$(filepath, lastSlash + 1)
    
    
    Exit Function
    
    
'-----------------------------------------------------
IllegalFilePathException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Illegal file path: " & filepath)
    
End Function





'**************************************************************************
' Name:       getParentalFolderPath
'
' Comment:    Returns the path of the folder containing the given file.
'
' Parameters:
'   filepath  Path of a file which folder path is to be returned.
'
' Returns:
'   String    The path to the folder where the given file is stored.
'**************************************************************************
Public Function getParentalFolderPath(filepath As String) As String
    Const METHOD_NAME As String = "getParentalFolderPath"
    '-----------------------------------------------------
    Dim lastSlash As Integer
    '-----------------------------------------------------
    
    lastSlash = InStrRev(filepath, "\")
    
    
    On Error GoTo IllegalFilePathException
    getParentalFolderPath = Left$(filepath, lastSlash)
    
    
    Exit Function
    
    
'-----------------------------------------------------
IllegalFilePathException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Illegal file path: " & filepath)
    
End Function






'**************************************************************************
' Name:       uniqueFileName
'
' Comment:    Checks if the given filename would be unique in the file system.
'             If it is not, a proper ordinal number is appended in brackets.
'
' Parameters:
'   filepath  Path of a file which name is to be checked.
'**************************************************************************
Public Function uniqueFileName(fileName As String) As String
    Const METHOD_NAME As String = "uniqueFileName"
    '-----------------------------------------------------
    Dim strExtension As String
    Dim strBaseName As String
    Dim strFileFolderPath As String
    Dim intVersion As Integer:                              intVersion = 1
    '-----------------------------------------------------
    
    strExtension = getFileExtension(fileName)
    strBaseName = getFileNameFromFullPath(fileName)
    strFileFolderPath = getParentalFolderPath(fileName)
    uniqueFileName = fileName
    
    Do While fileExists(uniqueFileName)
        intVersion = intVersion + 1
        uniqueFileName = strFileFolderPath & strBaseName & " (" & addLeadingZeros(intVersion, 2) & ")" & "." & strExtension
    Loop
    
End Function






'*********************************************************************
'   Comments:       Displays browsing window and let choose one or many files to be open.
'
'   Arguments:      title           Title of the browsing window displayed on the screen.
'                   multiSelect     Optional boolean argument. Default value is True.
'                                   Determines if user can select many files at the same time.
'                   fileFilter      Optional String argument. Allows to limit selectable format
'                                   of file. By default user is allows to select all format of
'                                   file.
'                   defaultDir      Optional String argument. If it is given, browse window
'                                   is intialized in a folder specified in this argument.
'
'   Returns:        Variant         Path of files selected by user.
'                                   If user has selected only one file, String is returned.
'                                   If user has selected multiple files, array of Strings is returned.
'                                   If used has clicked [Cancel] button False is returned.
'*********************************************************************
Public Function openFiles(title As String, Optional multiSelect As Boolean = True, _
                            Optional fileFilter As String = "All files:*.*", _
                            Optional defaultDir As String) As Variant
    Const METHOD_NAME As String = "openFiles"
    Const DIALOG_TITLE As String = "Select file"
    Const msoFileDialogOpen As Long = 1
    '-----------------------------------------------------
    Dim fDialog As Object '              Office.FileDialog
    Dim arrSelectedFiles() As String
    Dim strSelectedFile As String
    Dim lngSelectedFileIterator As Long
    Dim lngSelectedFilesCounter As Long
    '-----------------------------------------------------
    Dim varFilters As Variant
    Dim varFilter As Variant
    Dim strFilterName As String
    Dim strFilterExtension As String
    '-----------------------------------------------------
    
    
    'Sets the initial directory.
    If Len(defaultDir) Then Call setDefaultDir(defaultDir)
    Debug.Print defaultDir
    Debug.Print CurDir$
    
    
    'Parsing filters
    varFilters = Split(fileFilter, "|")
    
    
    'Displays the window to select files.
    Set fDialog = Application.FileDialog(msoFileDialogOpen)
    With fDialog
        .AllowMultiSelect = multiSelect
        .title = DIALOG_TITLE
        
        'Adds file filtering.
        If Not isNonEmptyArray(varFilters) Then
            With .Filters
                Call .clear
                
                For Each varFilter In varFilters
                    strFilterName = substring(CStr(varFilter), "", FILTER_DELIMITER)
                    strFilterExtension = substring(CStr(varFilter), FILTER_DELIMITER, "")
                    Call .Add(strFilterName, strFilterExtension)
                Next varFilter
                
            End With
        End If
        '--------------------
        
        Call .Show
        
        
        'Checks the selected files
        lngSelectedFilesCounter = .SelectedItems.count
        If lngSelectedFilesCounter Then
            If multiSelect Then
                ReDim arrSelectedFiles(1 To lngSelectedFilesCounter)
                For lngSelectedFileIterator = 1 To lngSelectedFilesCounter
                    arrSelectedFiles(lngSelectedFileIterator) = .SelectedItems(lngSelectedFileIterator)
                Next lngSelectedFileIterator
                
                openFiles = arrSelectedFiles
                
            Else
                openFiles = .SelectedItems(1)
            End If
        Else
            openFiles = Empty
        End If
        
        
    End With
    

End Function







'*********************************************************************
'   Comments:       Sets default dir.
'
'   Arguments:      defaultDir  Direction to be set.
'*********************************************************************
Public Sub setDefaultDir(defaultDir As String)
    On Error GoTo errHandler
   
    If Len(defaultDir) Then
    
        Call SetCurrentDirectory(defaultDir)
        
        '\\Old version of this function. It doesn't work with network paths.
        'Call ChDrive(Left(defaultDir, 1))
        'Call ChDir(defaultDir)
    
    End If

errHandler:
End Sub


