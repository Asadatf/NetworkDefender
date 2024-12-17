class NetworkPathManager {
  constructor(scene, nodesGroup) {
    this.scene = scene;
    this.nodes = nodesGroup.getChildren(); // Use pre-existing nodes from the group
    this.currentPath = []; // Selected path for message
    this.maxNodes = nodesGroup.getChildren().length;
    this.isValid = false;
    this.menuActive = false;
    this.correctIP = "192.168.1.1"; // Example correct IP (can be dynamically set)
    this.timeManager = this.scene.timeManager;
  }

  // initializeNetworkTopology() {
  //   // Add interactive capabilities to pre-existing nodes
  //   this.nodes.forEach((node) => {
  //     node.setInteractive();
  //     node.on("pointerdown", () => this.openIPPopup(node));
  //     // node.on("pointerdown", () => this.checkIP(node));
  //   });
  // }

  initializeNetworkTopology() {
    let firstInteraction = true;

    this.nodes.forEach((node) => {
      node.setInteractive();
      node.on("pointerdown", () => {
        // Start timer on first interaction only
        if (firstInteraction && this.timeManager) {
          this.timeManager.startTimer();
          firstInteraction = false;
        }
        this.openIPPopup(node);
      });
    });
  }

  validatePath() {
    // Simple path validation logic
    const hasSwitch = this.currentPath.some((node) => node.type === "switch");
    // const hasRouter = this.currentPath.some((node) => node.type === "router");

    if (hasSwitch) {
      // Path is valid, allow message transmission
      this.highlightValidPath();
    } else {
      console.log("Resetting Path");
      // Invalid path, reset
      this.resetPath();
    }
  }

  highlightValidPath() {
    this.isValid = true;
    // Draw lines between nodes
    this.currentPath.forEach((node, index) => {
      if (index < this.currentPath.length - 1) {
        const nextNode = this.currentPath[index + 1];
        this.scene.add
          .line(
            0,
            0,
            node.x,
            node.y,
            nextNode.x,
            nextNode.y,
            0x00ff00 // Green connection line
          )
          .setOrigin(0, 0)
          .setLineWidth(2);
      }
    });
  }

  isPathValid() {
    if (this.isValid) return true;
    else return false;
  }

  resetPath() {
    // Clear node highlights and path
    this.currentPath.forEach((node) => node.highlight(false));
    this.currentPath = [];
  }

  openIPPopup(node) {
    if (!this.menuActive) {
      this.menuActive = true;

      // Popup Menu setup
      this.menuBackground = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        400,
        300,
        0x000000,
        0.7
      );

      this.menuText = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2 - 100,
          "Enter the correct IP address to configure this node:",
          {
            fontSize: "24px",
            fill: "#ffffff",
            align: "center",
          }
        )
        .setOrigin(0.5);

      this.ipInputField = this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, "_", {
          fontSize: "20px",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      this.userIP = ""; // New IP entry

      // Remove previous keydown listener if exists
      if (this.keydownListener) {
        this.scene.input.keyboard.off("keydown", this.keydownListener);
      }

      this.keydownListener = (event) => {
        if (this.menuActive) {
          // IP typing logic
          if (event.key === "Backspace") {
            this.userIP = this.userIP.slice(0, -1);
          } else if (event.key.length === 1 && /[0-9.]|\b/.test(event.key)) {
            this.userIP += event.key;
          } else if (event.key === "Enter") {
            this.checkIP(node);
          }
          this.ipInputField.setText(this.userIP + "_");
        }
      };

      // Attach the new listener
      this.scene.input.keyboard.on("keydown", this.keydownListener);
    }
  }

  // checkIP(node) {
  //   // Check if the entered IP is correct
  //   if (this.userIP === this.correctIP) {
  //     console.log("Correct IP entered!");

  //     // Highlight the node and add it to the path
  //     node.highlight(true);
  //     this.currentPath.push(node);

  //     // Close the popup
  //     this.closePopup();

  //     // Check if path is complete
  //     if (this.currentPath.length === this.maxNodes) {
  //       this.validatePath();
  //     }
  //   } else {
  //     console.log("Incorrect IP! Try again.");
  //     this.ipInputField.setText("Incorrect IP! Try again.");
  //     this.userIP = ""; // Reset the IP input
  //   }
  //   // node.highlight(true);
  //   // this.currentPath.push(node);
  //   // if (this.currentPath.length === this.maxNodes) {
  //   //   this.validatePath();
  //   // }
  // }

  checkIP(node) {
    if (this.userIP === this.correctIP) {
      console.log("Correct IP entered!");

      node.highlight(true);
      this.currentPath.push(node);

      this.closePopup();

      if (this.currentPath.length === this.maxNodes) {
        this.validatePath();
      }
    } else {
      console.log("Incorrect IP! Try again.");
      this.ipInputField.setText("Incorrect IP! Try again.");
      this.userIP = "";

      // Add time penalty for incorrect IP
      if (this.timeManager) {
        this.timeManager.addPenalty(5); // 5-second penalty
      }
    }
  }

  closePopup() {
    this.menuActive = false;
    this.menuBackground.destroy();
    this.menuText.destroy();
    this.ipInputField.destroy();
  }
}

window.NetworkPathManager = NetworkPathManager;
