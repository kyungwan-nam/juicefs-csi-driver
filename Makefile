# Copyright 2018 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
IMAGE=juicedata/juicefs-csi-driver
REGISTRY=docker.io
VERSION=0.1.0
CSI_SPEC=csi-v0.3.0

.PHONY: juicefs-csi-driver
juicefs-csi-driver:
	mkdir -p bin
	CGO_ENABLED=0 GOOS=linux go build -ldflags "-X github.com/juicedata/juicefs-csi-driver/pkg/driver.vendorVersion=${VERSION}" -o bin/juicefs-csi-driver ./cmd/

.PHONY: verify
verify:
	./hack/verify-all

.PHONY: test
test:
	go test -v -race ./pkg/...

.PHONY: image
image:
	docker build -t $(IMAGE):latest .

.PHONY: push
push:
	docker tag $(IMAGE):latest $(REGISTRY)/$(IMAGE):latest
	docker push $(REGISTRY)/$(IMAGE):latest

.PHONY: image-dev
image-dev: juicefs-csi-driver
	docker build -t $(IMAGE):dev -f dev.Dockerfile bin

.PHONY: push-dev
push-dev:
	docker tag $(IMAGE):dev $(REGISTRY)/$(IMAGE):dev
	docker push $(REGISTRY)/$(IMAGE):dev

.PHONY: image-release
image-release:
	docker build -t $(IMAGE):$(VERSION) .

.PHONY: push-release
push-release:
	docker push $(IMAGE):$(VERSION)
	docker tag $(IMAGE):$(VERSION) $(IMAGE):$(CSI_SPEC)
	docker push $(IMAGE):$(CSI_SPEC)

.PHONY: deploy/k8s.yaml
deploy/k8s.yaml:
	echo "# DO NOT EDIT: generated by 'kustomize build'" > $@
	kustomize build deploy/driver/overlays/csi-v0.3.0 >> $@

.PHONY: deploy
deploy: deploy/k8s.yaml
	kubectl apply -f $<

.PHONY: deploy-delete
uninstall: deploy/k8s.yaml
	kubectl delete -f $<

.PHONY: driver-dev-apply
driver-dev-apply:
	kustomize build deploy/driver/overlays/dev/ | kubectl apply -f -
	kubectl delete -n kube-system pod juicefs-csi-attacher-0

.PHONY: driver-dev-delete
driver-dev-delete:
	kustomize build deploy/driver/overlays/dev/ | kubectl delete -f -
