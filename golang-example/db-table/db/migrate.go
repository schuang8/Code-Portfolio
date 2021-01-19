package db

import (
	"db-table/model"
	"github.com/jinzhu/gorm"
)

func MigrateDB(db *gorm.DB) error {
	db.AutoMigrate(&model.DbEntry{})
	return nil
}
