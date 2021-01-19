package app

import (
	"db-table/db"
	"github.com/gorilla/mux"
)

type App struct {
	Database *db.Database
	Router   *mux.Router
}

func New() (app *App, err error) {
	app = &App{}
	app.Database, err = db.Init()
	if err != nil {
		return nil, err
	}
	app.Router = mux.NewRouter()
	return app, err
}

func (a *App) Close() error {
	return a.Database.Close()
}
