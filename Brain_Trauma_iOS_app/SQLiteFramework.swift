//
//  File.swift
//  B.T.A.P.
//
//  Created by Sherwood Xiao Yang Chuang on 4/4/16.
//  Copyright © 2016 Vertically Integrated Projects. All rights reserved.
//

import Foundation
import SQLite

enum DataAccessError: Error {
    case datastore_Connection_Error
    case insert_Error
    case delete_Error
    case search_Error
    case nil_In_Data
}

typealias UserSession = (
    SessionID: String?,
    User: String?,
    StartTime: String?,
    Date: String?,
    StopTime: String?,
    TestDataFile: String?
)

typealias UserProfile = (
    Username: String?,
    Password: String?,
    FirstName: String?,
    LastName: String?,
    PatientBday: String?,
    PatientGender: String?,
    ClinicianCompany: String?
)

protocol DataHelperProtocol {
    associatedtype T
    static func createTable() throws -> Void
    static func insert(_ item: T) throws -> Int64
    static func delete(_ item: T) throws -> Void
    static func findAll () throws -> [T]?
}

class SQLiteDataStore {
    static let sharedInstance = SQLiteDataStore()
    let BBDB: Connection?
    
    fileprivate init() {
        var path = "BTAPDB.sqlite"
        
        if let dirs: [NSString] = NSSearchPathForDirectoriesInDomains(FileManager.SearchPathDirectory.documentDirectory, FileManager.SearchPathDomainMask.allDomainsMask, true) as [NSString] {
            let dir = dirs[0];
            path = dir.appendingPathComponent("BTAPDB.sqlite")
            
        }
        
        do {
            BBDB = try Connection(path)
        } catch _ {
            BBDB = nil
        }
    }
    
    func createTables() throws {
        do {
            try TestSessionDataHelper.createTable()
        } catch {
            throw DataAccessError.datastore_Connection_Error
        }
        do {
            try UserProfileHelper.createTable()
        } catch {
            throw DataAccessError.datastore_Connection_Error
        }
        
    }
}

class TestSessionDataHelper: DataHelperProtocol {
    static let TABLE_NAME = "Tests"
    static let table = Table(TABLE_NAME)
    static let SessionID = Expression<String>("SessionID")
    static let User = Expression<String>("User")
    static let StartTime = Expression<String>("StartTime")
    static let Date = Expression<String>("Date")
    static let StopTime = Expression<String>("StopTime")
    static let TestDataFile = Expression<String>("TestDataFile")
    
    typealias T = UserSession
    
    static func createTable() throws {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        
        do {
            let _ = try DB.run( table.create(ifNotExists: true) {t in
                t.column(SessionID, primaryKey: true)
                t.column(User)
                t.column(StartTime)
                t.column(Date)
                t.column(StopTime)
                t.column(TestDataFile)
            })
        } catch _ {
            // Error throw if table already exists
        }
    }
    
    static func insert(_ item: T) throws -> Int64 {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        if (item.User != nil && item.Date != nil && item.StartTime != nil && item.StopTime != nil && item.TestDataFile != nil) {
            let insert = table.insert(User <- item.User!, Date <- item.Date!, StartTime <- item.StartTime!, StopTime <- item.StopTime!, TestDataFile <- item.TestDataFile!)
            do {
                 let rowId = try DB.run(insert)
                guard rowId > 0 else {
                    throw DataAccessError.insert_Error
                }
                return rowId
            } catch _ {
                throw DataAccessError.insert_Error
            }
        }
        throw DataAccessError.nil_In_Data
    }
    
    static func delete (_ item: T) throws -> Void {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        if let id = item.SessionID {
            let query = table.filter(SessionID == id)
            do {
                let tmp = try DB.run(query.delete())
                guard tmp == 1 else {
                    throw DataAccessError.delete_Error
                }
            } catch _ {
                throw DataAccessError.delete_Error
            }
        }
    }
    
    static func find(_ id: String) throws -> T? {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        let query = table.filter(SessionID == id)
        let items = try DB.prepare(query)
        for item in items {
            return UserSession(SessionID: item[SessionID], User: item[User], StartTime: item[StartTime], Date: item[Date], StopTime: item[StopTime], TestDataFile: item[TestDataFile])
        }
        
        return nil
    }
    
    static func findAll() throws -> [T]? {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        var retArray = [T]()
        let items = try DB.prepare(table)
        for item in items {
            retArray.append(UserSession(SessionID: item[SessionID], User: item[User], StartTime: item[StartTime], Date: item[Date], StopTime: item[StopTime], TestDataFile: item[TestDataFile]))
        }
        
        return retArray
    }
}

class UserProfileHelper: DataHelperProtocol {
    static let TABLE_NAME = "Users"
    static let table = Table(TABLE_NAME)
    static let Username = Expression<String>("Username")
    static let Password = Expression<String>("Password")
    static let FirstName = Expression<String>("FirstName")
    static let LastName = Expression<String>("LastName")
    static let PatientBday = Expression<String>("PatientBday")
    static let PatientGender = Expression<String>("PatientGender")
    static let ClinicianCompany = Expression<String>("ClinicianCompany")
    
    typealias U = UserProfile
    
    static func createTable() throws {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        
        do {
            let _ = try DB.run( table.create(ifNotExists: true) {t in
                t.column(Username, primaryKey: true)
                t.column(Password)
                t.column(FirstName)
                t.column(LastName)
                t.column(PatientBday)
                t.column(PatientGender)
                t.column(ClinicianCompany)
                })
        } catch _ {
            // Error throw if table already exists
        }
    }
    
    static func insert(_ item: U) throws -> Int64 {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        if (item.Password != nil && item.FirstName != nil && item.LastName != nil && item.PatientBday != nil && item.PatientGender != nil && item.ClinicianCompany != nil) {
            let insert = table.insert(Password <- item.Password!, FirstName <- item.FirstName!, LastName <- item.LastName!, PatientBday <- item.PatientBday!, PatientGender <- item.PatientGender!, ClinicianCompany <- item.ClinicianCompany!)
            do {
                let rowId = try DB.run(insert)
                guard rowId > 0 else {
                    throw DataAccessError.insert_Error
                }
                return rowId
            } catch _ {
                throw DataAccessError.insert_Error
            }
        }
        throw DataAccessError.nil_In_Data
    }
    
    static func delete (_ item: U) throws -> Void {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        if let id = item.Username {
            let query = table.filter(Username == id)
            do {
                let tmp = try DB.run(query.delete())
                guard tmp == 1 else {
                    throw DataAccessError.delete_Error
                }
            } catch _ {
                throw DataAccessError.delete_Error
            }
        }
    }
    
    static func find(_ id: String) throws -> U? {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        let query = table.filter(Username == id)
        let items = try DB.prepare(query)
        for item in items {
            return UserProfile(Username: item[Username], Password: item[Password], FirstName: item[FirstName], LastName: item[LastName], PatientBday: item[PatientBday], PatientGender: item[PatientGender], ClinicianCompany: item[ClinicianCompany])
        }
        
        return nil
    }
    
    static func findAll() throws -> [U]? {
        guard let DB = SQLiteDataStore.sharedInstance.BBDB else {
            throw DataAccessError.datastore_Connection_Error
        }
        var retArray = [U]()
        let items = try DB.prepare(table)
        for item in items {
            retArray.append(UserProfile(Username: item[Username], Password: item[Password], FirstName: item[FirstName], LastName: item[LastName], PatientBday: item[PatientBday], PatientGender: item[PatientGender], ClinicianCompany: item[ClinicianCompany]))
        }
        
        return retArray
    }
}
