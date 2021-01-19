package main

import (
	"flag"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/kardianos/service"
)

type program struct {
	serviceCmds []*exec.Cmd
}

func (p *program) runservice(cmd *exec.Cmd) {
	cmd.Run()
}

func (p *program) Start(s service.Service) error {
	p.serviceCmds = make([]*exec.Cmd, 6)
	runPath, _ := os.Executable()
	runDir := filepath.Dir(runPath)

	env := os.Environ()
	env = append(env, "SHARED_SECRET="+sharedSecret)

	binPath := filepath.Join(runDir, "services", "windows-service.exe")
	configPath := filepath.Join(os.ExpandEnv("./Test Service/"), constant.ConfigYaml)
	p.serviceCmds[0] = exec.Command(binPath, "serve")

	for _, cmd := range p.serviceCmds {
		cmd.Env = env
		go p.runservice(cmd)
	}
	return nil
}

func (p *program) Stop(s service.Service) error {
	for _, cmd := range p.serviceCmds {
		if cmd.Process != nil {
			_ := cmd.Process.Kill()
		}
	}
	return nil
}

func main() {
	flags := flag.String("service", "", "Control the system service.")
	flag.Parse()

	config := &service.Config{
		Name:        "WindowsServiceManager",
		DisplayName: "Windows Service Manager",
		Description: "Windows Service Manager",
	}

	s, _ := service.New(&program{}, config)

	if len(*flags) != 0 {
		_ := service.Control(s, *flags)
		return
	}
	_ := s.Run()
}
