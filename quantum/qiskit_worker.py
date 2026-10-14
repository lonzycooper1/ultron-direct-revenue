#!/usr/bin/env python3
"""ULTRON optional Qiskit proof-of-concept. Never runs paid/cloud hardware by default."""
import argparse
import json
import os

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--hardware",action="store_true",help="Use owner-provided IBM Quantum account and QPU quota")
    p.add_argument("--confirm-hardware",action="store_true",help="Explicitly confirm remote resource use")
    args=p.parse_args()
    from qiskit import QuantumCircuit
    bell=QuantumCircuit(2)
    bell.h(0)
    bell.cx(0,1)
    if not args.hardware:
        from qiskit.quantum_info import Statevector
        probs=Statevector.from_instruction(bell).probabilities_dict()
        print(json.dumps({"engine":"LOCAL_QISKIT_CLASSICAL_SIMULATOR","hardwareUsed":False,"probabilities":{k:round(float(v),8) for k,v in probs.items()}}))
        return
    if not args.confirm_hardware:
        p.error("Hardware execution requires --confirm-hardware")
    key=os.environ.get("IBM_QUANTUM_API_KEY")
    instance=os.environ.get("IBM_QUANTUM_CRN")
    if not key or not instance:
        p.error("IBM_QUANTUM_API_KEY and IBM_QUANTUM_CRN must come from a secure environment")
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    from qiskit.transpiler import generate_preset_pass_manager
    service=QiskitRuntimeService(channel="ibm_quantum_platform",token=key,instance=instance)
    backend=service.least_busy(operational=True,simulator=False,min_num_qubits=2)
    bell.measure_all()
    isa=generate_preset_pass_manager(backend=backend,optimization_level=1).run(bell)
    result=Sampler(mode=backend).run([isa],shots=128).result()[0]
    print(json.dumps({"engine":"IBM_QUANTUM_HARDWARE","hardwareUsed":True,"backend":backend.name,"shots":128,"counts":result.data.meas.get_counts(),"quantumAdvantageProven":False}))

if __name__=="__main__":
    main()
