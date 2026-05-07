-- Register Model
INSERT INTO "Model" ("id", "displayName", "displayNameShort", "layers", "neuronsPerLayer", "owner", "creatorId", "visibility", "inferenceEnabled")
VALUES ('lewm-robot', 'LeWorldModel (Robot)', 'LeWM', 12, 12288, 'AMI Labs', 'clkht01d40000jv08hvalcvly', 'PUBLIC', true)
ON CONFLICT (id) DO NOTHING;

-- Register SourceSet
INSERT INTO "SourceSet" ("modelId", "name", "description", "creatorId", "creatorName", "visibility")
VALUES ('lewm-robot', 'encoder-stack', 'Layered Encoder Transcoders (L0-L11)', 'clkht01d40000jv08hvalcvly', 'Antigravity', 'PUBLIC')
ON CONFLICT ("modelId", "name") DO NOTHING;

-- Register Sources (Layers 0-11)
INSERT INTO "Source" ("modelId", "id", "setName", "creatorId", "visibility") VALUES
('lewm-robot', 'layer-0', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-1', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-2', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-3', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-4', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-5', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-6', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-7', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-8', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-9', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-10', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC'),
('lewm-robot', 'layer-11', 'encoder-stack', 'clkht01d40000jv08hvalcvly', 'PUBLIC')
ON CONFLICT ("modelId", "id") DO NOTHING;
