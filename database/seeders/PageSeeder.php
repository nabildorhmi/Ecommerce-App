<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::updateOrCreate(
            ['slug' => 'a-propos'],
            [
                'title' => 'A propos de MiraiTech',
                'content' => <<<'MD'
MiraiTech est une entreprise innovante basee a Casablanca, Maroc, specialisee dans la conception et la distribution de trottinettes electriques premium. Notre mission est de revolutionner la mobilite urbaine en offrant des solutions de transport ecologiques, performantes et elegantes.

Chaque trottinette MiraiTech est concue avec une attention particuliere portee a la qualite, la securite et l'innovation technologique. Nous utilisons des materiaux de haute qualite et integrons les dernieres avancees en matiere de batteries longue portee, de moteurs puissants et de systemes de controle intelligents.

Notre equipe passionnee s'engage a fournir une experience client exceptionnelle, de la selection du produit a la livraison et au service apres-vente. Nous croyons en un avenir ou la mobilite urbaine est a la fois durable, accessible et agreable.
MD,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'contact'],
            [
                'title' => 'Contactez-nous',
                'content' => <<<'MD'
## Adresse

123 Bd Mohammed V, Casablanca, Maroc

## Telephone

+212 600 000 000

## E-mail

contact@miraitech.ma

## WhatsApp

Cliquez sur le bouton WhatsApp en bas a droite de la page pour nous contacter directement.
MD,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'cgv'],
            [
                'title' => 'Conditions Generales de Vente',
                'content' => <<<'MD'
## 1. Objet

Les presentes conditions generales de vente regissent les ventes de trottinettes electriques effectuees par MiraiTech. Toute commande implique l'acceptation sans reserve des presentes conditions.

## 2. Prix

Les prix sont indiques en dirhams marocains (MAD) toutes taxes comprises. MiraiTech se reserve le droit de modifier ses prix a tout moment, mais les produits seront factures sur la base des tarifs en vigueur au moment de la validation de la commande.

## 3. Commande

Les commandes sont validees apres verification de la disponibilite des produits. Vous recevrez une confirmation par telephone ou e-mail. Le paiement s'effectue a la livraison en especes.

## 4. Livraison

La livraison est effectuee a l'adresse indiquee lors de la commande. Les delais de livraison sont communiques a titre indicatif. En cas de retard, aucune penalite ne pourra etre appliquee.

## 5. Retours

Les retours sont possibles dans un delai de 14 jours a compter de la reception, sous reserve que le produit soit dans son emballage d'origine et en parfait etat. Les frais de retour sont a la charge du client.

## 6. Garantie

Tous nos produits sont garantis contre les defauts de fabrication. La duree de garantie varie selon les modeles et est precisee sur la fiche produit. La garantie ne couvre pas l'usure normale ou les dommages resultant d'une utilisation inappropriee.
MD,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'mentions-legales'],
            [
                'title' => 'Mentions Legales',
                'content' => <<<'MD'
## Editeur du site

MiraiTech SARL
123 Bd Mohammed V, Casablanca, Maroc
Registre du commerce: XXXXXXXXX
Capital social: XXX XXX MAD
E-mail: contact@miraitech.ma

## Hebergeur

Le site est heberge par [Nom de l'hebergeur]
Adresse: [Adresse de l'hebergeur]
Telephone: [Telephone de l'hebergeur]

## Propriete intellectuelle

L'ensemble de ce site releve de la legislation marocaine et internationale sur le droit d'auteur et la propriete intellectuelle. Tous les droits de reproduction sont reserves, y compris pour les documents telechargeables et les representations iconographiques et photographiques.

## Donnees personnelles

Les informations collectees lors de votre commande sont destinees a MiraiTech pour le traitement de votre commande et la gestion de la relation client. Conformement a la loi, vous disposez d'un droit d'acces, de modification, de rectification et de suppression des donnees vous concernant.
MD,
            ]
        );

                Page::updateOrCreate(
                        ['slug' => 'site-settings'],
                        [
                                'title' => 'Parametres du site',
                                'content' => <<<'JSON'
{
    "whatsapp_number": "212600000000",
    "whatsapp_prefill_message": "Bonjour, je suis interesse(e) par vos trottinettes",
    "whatsapp_url": "",
    "instagram_url": "",
    "facebook_url": "",
    "email": "contact@miraitech.ma",
    "phone": "+212 6XX XXX XXX",
    "address": "123 Bd Mohammed V, Casablanca, Maroc",
    "business_hours": "Lun-Sam: 9h - 18h",
    "footer_description": "500+ clients satisfaits au Maroc. Trottinettes electriques premium avec garantie 2 ans et SAV local.",
    "home_promo_headline": "",
    "short_links": [
        { "label": "A propos", "url": "/a-propos" },
        { "label": "Contact", "url": "/contact" },
        { "label": "CGV", "url": "/cgv" },
        { "label": "Mentions legales", "url": "/mentions-legales" }
    ]
}
JSON,
                        ]
                );
    }
}
