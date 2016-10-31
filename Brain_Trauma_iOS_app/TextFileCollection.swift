//
//  DataCollection.swift
//  B.T.A.P.
//
//  Created by Sherwood Xiao Yang Chuang on 4/17/16.
//  Copyright © 2016 Vertically Integrated Projects. All rights reserved.
//

import SQLite
import UIKit
import AVFoundation
import Foundation

class TextFileCollection {
    static let sharedInstance = TextFileCollection()
    
    // take everything after this
    let fm = FileManager.default
    
    func getCacheDirectory() -> URL {
        let paths = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        return paths
    }
    
    func getFilesInDirectory(_ inputDirectory: URL) -> [URL] {
        var items = [URL] ()
        do {
            items = try fm.contentsOfDirectory(at: inputDirectory, includingPropertiesForKeys: nil, options: .skipsSubdirectoryDescendants) as [URL]
        } catch _ {
            
        }
        print("List of Objects in directory \(items)")
        return items
    }
    
    func createFile(_ header: String, saveFolder: URL, theUser: String, theSess: String) -> Bool {
        let currFile:String = "\(theUser)_\(theSess)"
        let savePath: URL = saveFolder.appendingPathComponent(currFile + ".txt")
        let listOfFiles = getFilesInDirectory(saveFolder)
        var fileExists:Bool = false
        for file in listOfFiles {
            if (file.pathComponents[1] == currFile) {
                fileExists = true
            }
            
        }
        if (fileExists == true) {
            return false
            // otherwise create the file and save the data
        } else {
            do {
                try header.write(to: savePath, atomically: true, encoding: String.Encoding.utf8)
            } catch let error as NSError{
                print(error.description)
            }
            return true
        }
    }
    
    func saveData(_ dataToBeSaved: String, saveFolder: URL, theUser: String, theSess: String) {
        let currFile: String = "\(theUser)_\(theSess)"
        let savePath: URL = saveFolder.appendingPathComponent(currFile + ".txt")
        let listOfFiles = getFilesInDirectory(saveFolder)
        var fileExists:Bool = false
        for file in listOfFiles {
            if (file.pathComponents[1] == currFile) {
                print("File already exists")
                fileExists = true
            }
            
        }
        do {
            var curText = try String(describing: (contentsOfURL: savePath, encoding: String.Encoding.utf8))
            curText = curText + dataToBeSaved
            print("Data Successfully Read")
            try curText.write(to: savePath, atomically: true, encoding: String.Encoding.utf8)
            print("Data Successfully Saved")
        } catch let error as NSError {
            print(error.description)
        }
        print(savePath)
    }
    
    func createFolder(_ folderName: String) {
        let listOfFiles = getFilesInDirectory(getCacheDirectory())
        let folderURL = getCacheDirectory().appendingPathComponent(folderName)
        var folderCreation:Bool!
        for folder in listOfFiles {
            if (folderURL == folder) {
                folderCreation = false
            } else {
                do {
                    try fm.createDirectory(at: folderURL, withIntermediateDirectories: true, attributes: nil)
                    folderCreation = true
                } catch _ {
                    folderCreation = false
                }
            }
        }
    }
    
}
