package http

import (
	"context"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"db-table/api"
	"db-table/app"
	_model "db-table/model"
	"github.com/gorilla/mux"
	"github.com/oklog/run"
	log "github.com/sirupsen/logrus"
)

// State holds the global variables that are used by long running goroutines
type State struct {
	HTTPContext *Context
}

// Context is used to manage shared data across all sessions
type Context struct {
	sync.RWMutex
	Done chan bool
}

func createContext() *Context {
	return &Context{
		Done: make(chan bool),
	}
}

// ServeHTTP runs the HTTP server that is used to handle requests
func ServeHTTP(listener net.Listener, r *mux.Router) *Context {

	ctx := createContext()
	go func() {
		err := http.Serve(listener, r)
		if err != nil {
			log.Error("HTTP server exited with error: ", err)
		}
	}()

	return ctx
}

func RunServer(a *app.App) error {
	api := &api.API{App: a}
	// Initialize the api
	err := api.Init()
	if err != nil {
		log.Error("Error initializing api: ", err)
	}

	state := &State{}
	var g run.Group
	{
		//
		// Setup orderly shutdown for catchable signals
		//
		exec, intr := run.SignalHandler(context.Background(), syscall.SIGTERM, syscall.SIGINT)
		g.Add(exec, intr)
	}
	{
		//
		// Start the HTTPS listener
		//
		ctx, cancel := context.WithCancel(context.Background())

		// Start the http listener
		listenPort := net.JoinHostPort("0.0.0.0", "4200")
		listener, err := net.Listen("tcp", listenPort)
		if err != nil {
			cancel()
			return err
		}

		var tcpAddr *net.TCPAddr = listener.Addr().(*net.TCPAddr)

		g.Add(func() error {

			state.HTTPContext = ServeHTTP(listener, a.Router)

			<-state.HTTPContext.Done
			return ctx.Err()

		}, func(error) {
			listener.Close()
			state.HTTPContext.Done <- true
			cancel()
		})
	}

	err = g.Run()
	if err != nil {
		log.Fatalf("Http Runserver error: %s", err)
	}
	return err
}
