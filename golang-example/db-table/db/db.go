package db

import (
	"github.com/jinzhu/gorm"
	// the following import is required by jinzhu gorm
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/pkg/errors"
)

const (
	database    = "sqlite3"
	databaseURI = "dbfile"
)

type Database struct {
	*gorm.DB
}

func Init() (*Database, error) {
	db, err := gorm.Open(database, databaseURI)
	if err != nil {
		return nil, errors.Wrap(err, "Unable to connect to the database")
	}

	// Perform db migration
	err = MigrateDB(db)
	if err != nil {
		return nil, errors.Wrap(err, "DB schema migration failed")
	}

	return &Database{db}, nil
}
