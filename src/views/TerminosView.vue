<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function volver() {
    if (window.history.length > 1) {
        router.back();
        return;
    }
    router.push({ name: 'recibir' });
}
</script>

<template>
    <main class="fondo-trama min-h-[calc(100dvh-5rem)]">
        <div class="pagina-media">
            <button type="button" class="w-fit cursor-pointer text-primary" @click="volver">
                Volver
            </button>
            <article class="flex flex-col gap-6 rounded-md bg-surface p-6 shadow-md sm:p-8">
                <header class="flex flex-col gap-2">
                    <h1 class="font-heading text-2xl font-bold text-primary sm:text-3xl">
                        Términos y Condiciones de Uso de ecofarma
                    </h1>
                    <p class="text-sm text-muted">
                        Versión 1 — Definición, alcance, rol de ecofarma y catálogo de medicamentos
                    </p>
                    <p class="text-sm text-muted">
                        Estado del documento: borrador preliminar sujeto a revisión jurídica, sanitaria y a las decisiones
                        definitivas del equipo de ecofarma.
                    </p>
                </header>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">1. Objeto y finalidad de ecofarma</h2>
                    <p class="text-foreground">
                        ecofarma es una plataforma digital de carácter altruista y gratuito cuyo propósito es facilitar el
                        contacto entre personas particulares que dispongan de medicamentos que ya no necesiten y personas
                        particulares interesadas en recibirlos mediante donación.
                    </p>
                    <p class="text-foreground">
                        ecofarma funciona como un espacio de intermediación o “vidriera” entre potenciales donantes y
                        receptores, permitiendo publicar y solicitar medicamentos que cumplan con los requisitos
                        establecidos por la plataforma.
                    </p>
                    <p class="text-foreground">La finalidad principal de ecofarma es contribuir a:</p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>reducir el desperdicio de medicamentos;</li>
                        <li>facilitar el acceso a medicamentos a personas que los necesiten;</li>
                        <li>
                            promover la reutilización responsable de medicamentos que se encuentren en condiciones
                            compatibles con los requisitos que sean establecidos;
                        </li>
                        <li>fomentar acciones solidarias y altruistas entre personas;</li>
                        <li>contribuir a reducir el impacto ambiental relacionado con el descarte de medicamentos.</li>
                    </ul>
                    <p class="text-foreground">ecofarma no constituye un espacio destinado a la compraventa de medicamentos.</p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">2. Carácter gratuito de las donaciones</h2>
                    <p class="text-foreground">
                        Todas las operaciones realizadas a través de ecofarma deberán tener carácter exclusivamente
                        gratuito.
                    </p>
                    <p class="text-foreground">
                        Queda prohibida la utilización de ecofarma para vender, revender, comercializar o exigir
                        contraprestaciones económicas a cambio de los medicamentos publicados en la plataforma.
                    </p>
                    <p class="text-foreground">
                        El donante no podrá exigir al receptor el pago del medicamento como condición para realizar la
                        donación.
                    </p>
                    <p class="text-foreground">
                        La utilización de ecofarma deberá responder exclusivamente a los fines altruistas y solidarios
                        para los cuales fue creada la plataforma.
                    </p>
                    <p class="text-foreground">
                        ecofarma podrá intervenir, suspender o eliminar publicaciones y adoptar medidas respecto de
                        usuarios cuando detecte indicios de utilización de la plataforma con fines comerciales,
                        fraudulentos, maliciosos o contrarios a estas condiciones.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">3. Usuarios de ecofarma</h2>
                    <p class="text-foreground">
                        En esta primera versión del servicio, ecofarma estará destinada exclusivamente a personas físicas
                        que actúen a título individual.
                    </p>
                    <p class="text-foreground">
                        Dentro de la plataforma podrán existir, principalmente, dos tipos de participación:
                    </p>
                    <p class="text-foreground">
                        <strong>Donante.</strong>
                        Persona que declara disponer legítimamente de un medicamento que ya no necesita y manifiesta su
                        voluntad de ofrecerlo gratuitamente mediante ecofarma, sujeto al cumplimiento de los requisitos
                        establecidos por la plataforma.
                    </p>
                    <p class="text-foreground">
                        <strong>Receptor.</strong>
                        Persona que manifiesta interés o necesidad de recibir gratuitamente un medicamento publicado
                        mediante ecofarma y acepta las condiciones y declaraciones que correspondan antes de concretar la
                        operación.
                    </p>
                    <p class="text-foreground">
                        En esta etapa del proyecto no se contempla la participación directa de organizaciones,
                        fundaciones, empresas u otras personas jurídicas como donantes o receptores.
                    </p>
                    <p class="text-foreground">
                        La incorporación futura de otros tipos de usuarios podrá dar lugar a modificaciones de estos
                        Términos y Condiciones.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">4. Rol de ecofarma</h2>
                    <p class="text-foreground">
                        ecofarma actúa como plataforma intermediaria entre donantes y receptores.
                    </p>
                    <p class="text-foreground">
                        Su intervención tiene como finalidad facilitar la publicación, identificación y solicitud de
                        medicamentos y establecer mecanismos de control respecto de los medicamentos que pueden ser
                        publicados mediante el servicio.
                    </p>
                    <p class="text-foreground">ecofarma podrá:</p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>establecer requisitos para la publicación de medicamentos;</li>
                        <li>mantener un catálogo de referencia de medicamentos;</li>
                        <li>revisar medicamentos que no se encuentren previamente incorporados en dicho catálogo;</li>
                        <li>
                            aprobar o rechazar solicitudes de publicación conforme a los criterios definidos por la
                            plataforma;
                        </li>
                        <li>solicitar información adicional a los usuarios;</li>
                        <li>rechazar, suspender o eliminar publicaciones;</li>
                        <li>
                            intervenir ante publicaciones o conductas que resulten sospechosas, fraudulentas, maliciosas
                            o contrarias a estos Términos y Condiciones.
                        </li>
                    </ul>
                    <p class="text-foreground">
                        La intervención de ecofarma sobre una publicación no constituye, por sí misma, una garantía
                        respecto de la autenticidad, conservación, calidad, seguridad o estado físico de la unidad
                        concreta del medicamento que se encuentre en poder del donante.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">5. Posesión y manipulación de los medicamentos</h2>
                    <p class="text-foreground">
                        ecofarma no recibe, almacena ni manipula físicamente los medicamentos publicados por los usuarios.
                    </p>
                    <p class="text-foreground">
                        El medicamento permanece en posesión y bajo responsabilidad del donante hasta el momento en que se
                        produzca, en su caso, la entrega correspondiente.
                    </p>
                    <p class="text-foreground">
                        La información proporcionada mediante la plataforma respecto de una unidad determinada es
                        declarada por el usuario que realiza la publicación, sin perjuicio de los controles que ecofarma
                        pueda implementar.
                    </p>
                    <p class="text-foreground">
                        Los requisitos específicos relacionados con el estado del medicamento, conservación, integridad
                        del envase, vencimiento, procedencia, trazabilidad y demás condiciones necesarias para permitir
                        una donación serán establecidos separadamente conforme a los criterios sanitarios y jurídicos que
                        correspondan.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">6. Catálogo de medicamentos de ecofarma</h2>
                    <p class="text-foreground">
                        ecofarma dispondrá de un catálogo de referencia denominado provisionalmente “Catálogo de
                        medicamentos habilitados”, compuesto por información utilizada para identificar medicamentos que
                        pueden iniciar el proceso de publicación dentro de la plataforma.
                    </p>
                    <p class="text-foreground">
                        La inclusión de un producto en dicho catálogo permitirá a ecofarma reconocer determinados datos
                        asociados al medicamento, tales como su denominación, principio activo o nombre genérico,
                        concentración, forma farmacéutica, presentación, laboratorio titular y número de certificado
                        cuando dicha información se encuentre disponible.
                    </p>
                    <p class="text-foreground">
                        La presencia de un medicamento en el catálogo no constituye por sí sola una certificación de que
                        la unidad física ofrecida por un usuario se encuentra en condiciones adecuadas para ser donada.
                    </p>
                    <p class="text-foreground">
                        La admisión de un medicamento dentro del catálogo deberá entenderse únicamente como uno de los
                        requisitos necesarios para permitir su publicación.
                    </p>
                    <p class="text-foreground">
                        El medicamento deberá cumplir, además, con las restantes condiciones, controles y declaraciones
                        que ecofarma establezca.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">7. Medicamentos incluidos en el catálogo</h2>
                    <p class="text-foreground">
                        Cuando el medicamento seleccionado por el usuario se encuentre previamente reconocido dentro del
                        catálogo de ecofarma, la plataforma podrá permitir que el usuario continúe con el proceso de
                        publicación sin necesidad de una revisión manual previa destinada a identificar el producto.
                    </p>
                    <p class="text-foreground">
                        Esta admisión no libera al donante de proporcionar la información requerida respecto de la unidad
                        que posee ni de aceptar las declaraciones y condiciones correspondientes.
                    </p>
                    <p class="text-foreground">Asimismo, la inclusión del medicamento en el catálogo no implica que ecofarma:</p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>haya inspeccionado físicamente la unidad;</li>
                        <li>pueda conocer de manera directa las condiciones en las que fue almacenada;</li>
                        <li>garantice la integridad de su envase;</li>
                        <li>garantice su autenticidad;</li>
                        <li>garantice sus condiciones de conservación;</li>
                        <li>certifique que la unidad concreta resulte segura para su utilización.</li>
                    </ul>
                    <p class="text-foreground">
                        El donante será responsable por la veracidad de la información y declaraciones que proporcione
                        respecto del medicamento que ofrece.
                    </p>
                    <p class="text-foreground">
                        El receptor deberá aceptar las condiciones y declaraciones correspondientes antes de concretar
                        una solicitud o recepción.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">8. Medicamentos no incluidos en el catálogo</h2>
                    <p class="text-foreground">
                        Cuando un usuario pretenda ofrecer un medicamento que no se encuentre previamente incorporado en
                        el catálogo, su publicación no será autorizada automáticamente.
                    </p>
                    <p class="text-foreground">
                        La solicitud deberá quedar sujeta a un proceso de revisión por parte de ecofarma.
                    </p>
                    <p class="text-foreground">
                        Durante dicho proceso, ecofarma podrá solicitar al usuario información adicional que permita
                        identificar correctamente el medicamento y determinar si puede continuar dentro del proceso de
                        publicación.
                    </p>
                    <p class="text-foreground">Como resultado de la revisión, ecofarma podrá:</p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>
                            <strong>Admitir la solicitud:</strong>
                            permitiendo que el usuario continúe con los restantes requisitos necesarios para publicar el
                            medicamento.
                        </li>
                        <li>
                            <strong>Solicitar información adicional:</strong>
                            manteniendo la solicitud pendiente hasta que se proporcionen los datos requeridos.
                        </li>
                        <li>
                            <strong>Rechazar la solicitud:</strong>
                            impidiendo la publicación del medicamento mediante ecofarma.
                        </li>
                    </ul>
                    <p class="text-foreground">
                        La admisión manual de una solicitud no deberá interpretarse como garantía absoluta sobre la unidad
                        física que posea el usuario.
                    </p>
                    <p class="text-foreground">
                        Los criterios sanitarios concretos mediante los cuales ecofarma pueda determinar que una unidad es
                        “apta para donación” deberán ser definidos y validados antes de la implementación definitiva del
                        servicio.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">9. Alcance de la revisión realizada por ecofarma</h2>
                    <p class="text-foreground">
                        El proceso de revisión de ecofarma busca establecer controles adicionales sobre aquellos
                        medicamentos que no hayan sido previamente reconocidos en el catálogo.
                    </p>
                    <p class="text-foreground">
                        ecofarma podrá comprobar la identidad y características declaradas del medicamento utilizando las
                        fuentes y mecanismos de verificación que sean establecidos para tal finalidad.
                    </p>
                    <p class="text-foreground">
                        Sin embargo, salvo que existan mecanismos adicionales específicamente habilitados para ello, una
                        revisión realizada mediante información digital no equivale a una inspección física del producto.
                    </p>
                    <p class="text-foreground">
                        En consecuencia, la aprobación de una publicación no deberá interpretarse como una garantía de
                        ecofarma respecto de la seguridad, autenticidad, calidad, conservación o aptitud terapéutica de
                        la unidad concreta entregada entre los usuarios.
                    </p>
                    <p class="text-foreground">
                        Los alcances definitivos de este procedimiento deberán ajustarse a la normativa sanitaria que
                        resulte aplicable.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">10. Facultad de control y moderación de ecofarma</h2>
                    <p class="text-foreground">
                        ecofarma podrá rechazar, suspender o eliminar una publicación aunque el medicamento figure dentro
                        de su catálogo cuando existan motivos razonables para considerar que:
                    </p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>la información proporcionada es falsa, contradictoria o incompleta;</li>
                        <li>el medicamento publicado no coincide con la información declarada;</li>
                        <li>existen indicios de adulteración, fraude o actividad maliciosa;</li>
                        <li>la publicación persigue fines comerciales;</li>
                        <li>el usuario incumple estos Términos y Condiciones;</li>
                        <li>no se cumplen los requisitos establecidos para la publicación;</li>
                        <li>
                            la publicación pudiera resultar incompatible con requisitos sanitarios, jurídicos o de
                            seguridad aplicables.
                        </li>
                    </ul>
                    <p class="text-foreground">
                        La presencia de un medicamento dentro del catálogo no otorga al usuario un derecho automático e
                        irrevocable a mantenerlo publicado.
                    </p>
                    <p class="text-foreground">
                        ecofarma podrá actuar preventivamente cuando considere necesario revisar una publicación antes de
                        permitir que continúe el proceso de donación.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">11. Actualización del catálogo</h2>
                    <p class="text-foreground">El catálogo de ecofarma tendrá carácter dinámico.</p>
                    <p class="text-foreground">
                        ecofarma podrá actualizar, ampliar, corregir, suspender o retirar medicamentos del catálogo cuando
                        resulte necesario debido a:
                    </p>
                    <ul class="list-disc space-y-1 pl-5 text-foreground">
                        <li>actualizaciones de las fuentes de información utilizadas;</li>
                        <li>modificaciones en los criterios de admisión de la plataforma;</li>
                        <li>detección de información incorrecta o desactualizada;</li>
                        <li>cambios sanitarios o regulatorios;</li>
                        <li>razones de seguridad;</li>
                        <li>cualquier otra circunstancia que justifique revisar la admisión de un medicamento.</li>
                    </ul>
                    <p class="text-foreground">
                        El hecho de que un medicamento haya estado incluido previamente no garantiza su permanencia futura
                        dentro del catálogo.
                    </p>
                    <p class="text-foreground">
                        ecofarma procurará utilizar información actualizada para mantener el catálogo, sin perjuicio de
                        las verificaciones adicionales que correspondan antes de autorizar publicaciones.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">12. Responsabilidad sobre la información declarada</h2>
                    <p class="text-foreground">
                        Los usuarios se comprometen a proporcionar información verdadera, completa y actualizada respecto
                        de los medicamentos ofrecidos o solicitados.
                    </p>
                    <p class="text-foreground">
                        El donante será responsable por las declaraciones que efectúe respecto del medicamento que
                        permanece en su poder.
                    </p>
                    <p class="text-foreground">
                        La aceptación de una publicación por parte de ecofarma no sustituye las obligaciones del donante
                        ni implica que ecofarma asuma como propia la información declarada por este.
                    </p>
                    <p class="text-foreground">
                        El receptor deberá evaluar la información disponible, cumplir con las condiciones de uso y aceptar
                        las declaraciones correspondientes antes de recibir un medicamento.
                    </p>
                    <p class="text-foreground">
                        Las obligaciones específicas del donante y del receptor serán desarrolladas en las respectivas
                        Declaraciones Juradas de Donación y Recepción, que formarán parte del sistema documental de
                        ecofarma.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">13. Condiciones de entrega</h2>
                    <p class="text-foreground">
                        ecofarma no realizará directamente el transporte, almacenamiento, custodia ni entrega física de
                        los medicamentos.
                    </p>
                    <p class="text-foreground">
                        La entrega será coordinada y realizada directamente entre el donante y el receptor, quienes
                        acordarán entre sí las condiciones necesarias para concretarla.
                    </p>
                    <p class="text-foreground">
                        ecofarma actuará exclusivamente como plataforma intermediaria, facilitando el contacto y la
                        gestión de la operación, sin intervenir físicamente en la entrega del medicamento.
                    </p>
                </section>

                <section class="flex flex-col gap-3">
                    <h2 class="font-heading text-lg font-bold text-foreground">14. Aceptación de las condiciones</h2>
                    <p class="text-foreground">
                        La utilización de ecofarma y la participación en operaciones de donación requerirán la aceptación
                        de los presentes Términos y Condiciones y de las declaraciones o documentos adicionales aplicables
                        a cada operación.
                    </p>
                    <p class="text-foreground">
                        La aceptación de los Términos y Condiciones generales no sustituye la aceptación de la Declaración
                        Jurada que corresponda a cada medicamento publicado o solicitado.
                    </p>
                    <p class="text-foreground">
                        ecofarma podrá impedir la publicación o solicitud de un medicamento cuando el usuario no haya
                        aceptado los documentos requeridos.
                    </p>
                </section>

                <p class="border-t border-line pt-4 text-sm text-muted">
                    Fin de la Parte I — Versión preliminar.
                    <RouterLink :to="{ name: 'declaracion-jurada' }" class="text-primary">
                        Ver Declaración Jurada
                    </RouterLink>
                </p>
            </article>
        </div>
    </main>
</template>
