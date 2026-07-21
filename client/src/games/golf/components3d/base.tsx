export default function Base({}: {}) {
    return (
        <group>
            <mesh receiveShadow position={[0, 0, -1]}>
                <meshStandardMaterial color="darkgreen" />
                <planeGeometry args={[200, 40]} />
            </mesh>
        </group>
    );
}
