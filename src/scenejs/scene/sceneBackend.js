/**
 * Backend for a scene node.
 */
SceneJS._backends.installBackend(

        "scene",

        function(ctx) {

            var initialised = false; // True as soon as first scene registered
            var scenes = {};
            var nScenes = 0;
            var activeSceneId;


            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene) {
                    if (!initialised) {
                        ctx.logging.info("SceneJS V" + SceneJS.version + " initialised");
                        ctx.events.fireEvent(SceneJS._eventTypes.INIT);
                    }
                    var sceneId = SceneJS._utils.createKeyForMap(scenes, "scene");
                    scenes[sceneId] = {
                        sceneId: sceneId,
                        scene:scene
                    };
                    nScenes++;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_CREATED, {sceneId : sceneId });
                    ctx.logging.info("Scene defined: " + sceneId);
                    return sceneId;
                },

                /** Deregisters scene
                 */
                deregisterScene :function(sceneId) {
                    scenes[sceneId] = null;
                    nScenes--;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DESTROYED, {sceneId : sceneId });
                    if (activeSceneId == sceneId) {
                        activeSceneId = null;
                    }
                    ctx.logging.info("Scene destroyed: " + sceneId);
                    if (nScenes == 0) {
                        ctx.logging.info("SceneJS reset");
                        ctx.events.fireEvent(SceneJS._eventTypes.RESET);

                    }
                },

                /** Specifies which registered scene is the currently active one
                 */
                activateScene : function(sceneId) {
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });                 
                },

                /** Returns all registered scenes
                 */
                getAllScenes:function() {
                    var list = [];
                    for (var id in scenes) {
                        var scene = scenes[id];
                        if (scene) {
                            list.push(scene.scene);
                        }
                    }
                    return list;
                },

                /** Finds a registered scene
                 */
                getScene : function(sceneId) {
                    return scenes[sceneId].scene;
                },

                /** Deactivates the currently active scene and reaps destroyed and timed out processes
                 */
                deactivateScene : function() {
                    if (!activeSceneId) {
                        throw "Internal error: no scene active";
                    }
                    var sceneId = activeSceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    //ctx.logging.info("Scene deactivated: " + sceneId);
                    activeSceneId = null;
                }
            };
        });