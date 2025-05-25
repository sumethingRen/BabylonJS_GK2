window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

        // Kamera
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -15), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        // Pencahayaan
        var light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
        light.position = new BABYLON.Vector3(5, 10, 5);
        light.intensity = 0.7;

        var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        // Transform node chair
        var chair = new BABYLON.TransformNode("chair", scene);

        // Kursi bagian-bagian
        var seat = BABYLON.MeshBuilder.CreateBox("seat", { width: 2, height: 0.3, depth: 2 }, scene);
        seat.position.y = 1.5;
        seat.parent = chair;
        shadowGenerator.addShadowCaster(seat);

        var backrest = BABYLON.MeshBuilder.CreateBox("backrest", { width: 2, height: 2, depth: 0.3 }, scene);
        backrest.position.y = 2.65;
        backrest.position.z = -0.85;
        backrest.parent = chair;
        shadowGenerator.addShadowCaster(backrest);

        var leg1 = BABYLON.MeshBuilder.CreateCylinder("leg1", { diameter: 0.2, height: 1.5 }, scene);
        leg1.position.set(-0.8, 0.75, -0.8);
        leg1.parent = chair;
        shadowGenerator.addShadowCaster(leg1);

        var leg2 = leg1.clone("leg2");
        leg2.position.z = 0.8;
        leg2.parent = chair;
        shadowGenerator.addShadowCaster(leg2);

        var leg3 = leg1.clone("leg3");
        leg3.position.x = 0.8;
        leg3.position.z = -0.8;
        leg3.parent = chair;
        shadowGenerator.addShadowCaster(leg3);

        var leg4 = leg1.clone("leg4");
        leg4.position.x = 0.8;
        leg4.position.z = 0.8;
        leg4.parent = chair;
        shadowGenerator.addShadowCaster(leg4);

        // Ground
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
        ground.receiveShadows = true;
        ground.position.y = 0;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.3 },
            scene
        );

        // Gunakan 1 mesh gabungan dari semua bagian kursi untuk fisika
        var parts = [seat, backrest, leg1, leg2, leg3, leg4];
        var chairMesh = BABYLON.Mesh.MergeMeshes(parts, true, true, undefined, false, true);
        chairMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            chairMesh,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.2, friction: 0.5 },
            scene
        );

        // Fungsi lompat
        function jump(mesh) {
            const velocity = mesh.physicsImpostor.getLinearVelocity();
            if (Math.abs(velocity.y) < 0.1) {
                mesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 5, 0), mesh.getAbsolutePosition());
            }
        }

        // Event tombol keyboard
        window.addEventListener("keydown", function (evt) {
            const impulse = 3;
            const pos = chairMesh.getAbsolutePosition();

            switch (evt.key.toLowerCase()) {
                case "w":
                    chairMesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, -impulse), pos);
                    break;
                case "s":
                    chairMesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, impulse), pos);
                    break;
                case "a":
                    chairMesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(-impulse, 0, 0), pos);
                    break;
                case "d":
                    chairMesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(impulse, 0, 0), pos);
                    break;
                case " ":
                    jump(chairMesh);
                    break;
            }
        });

        return scene;
    };

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
});
